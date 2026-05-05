# frozen_string_literal: true

module JekyllRelativeLinks
  class Generator < Jekyll::Generator
    attr_accessor :site, :config

    # Use Jekyll's native relative_url filter
    include Jekyll::Filters::URLFilters

    LINK_TEXT_REGEX = %r!(.*?)!.freeze
    FRAGMENT_REGEX = %r!(#.+?|)?!.freeze
    TITLE_REGEX = %r{(\s+"(?:\\"|[^"])*(?<!\\)"|\s+"(?:\\'|[^'])*(?<!\\)')?}.freeze
    FRAG_AND_TITLE_REGEX = %r!#{FRAGMENT_REGEX}#{TITLE_REGEX}!.freeze
    INLINE_LINK_REGEX = %r!\[#{LINK_TEXT_REGEX}\]\(([^)]+?)#{FRAG_AND_TITLE_REGEX}\)!.freeze
    REFERENCE_LINK_REGEX = %r!^\s*?\[#{LINK_TEXT_REGEX}\]: (.+?)#{FRAG_AND_TITLE_REGEX}\s*?$!.freeze
    LINK_REGEX = %r!(#{INLINE_LINK_REGEX}|#{REFERENCE_LINK_REGEX})!.freeze
    CONVERTER_CLASS = Jekyll::Converters::Markdown
    CONFIG_KEY = "relative_links"
    ENABLED_KEY = "enabled"
    COLLECTIONS_KEY = "collections"
    LOG_KEY = "Relative Links:"

    safe true
    priority :lowest

    def initialize(config)
      @config = config
    end

    def generate(site)
      return if disabled?

      @site    = site
      @context = context

      documents = site.pages
      documents = site.pages + site.docs_to_write if collections?

      documents.each do |document|
        next unless markdown_extension?(document.extname)
        next if document.is_a?(Jekyll::StaticFile)
        next if excluded?(document)

        replace_relative_links!(document)
      end
    end

    def replace_relative_links!(document)
      url_base = File.dirname(document.relative_path)
      return document if document.content.nil?

      document.content = document.content.dup.gsub(LINK_REGEX) do |original|
        link = link_parts(Regexp.last_match)
        next original unless replaceable_link?(link.path)

        path = path_from_root(link.path, url_base)
        url  = url_for_path(path)
        next original unless url

        link.path = url
        replacement_text(link)
      end

      replace_relative_links_excerpt!(document)
    rescue ArgumentError => e
      raise e unless e.to_s.start_with?("invalid byte sequence in UTF-8")
    end

    private

    # Stores info on a Markdown Link (avoid rubocop's Metrics/ParameterLists warning)
    Link = Struct.new(:link_type, :text, :path, :fragment, :title)

    def link_parts(matches)
      last_inline = 5
      link_type = matches[2] ? :inline : :reference
      link_text = matches[link_type == :inline ? 2 : last_inline + 1]
      relative_path = matches[link_type == :inline ? 3 : last_inline + 2]
      fragment = matches[link_type == :inline ? 4 : last_inline + 3]
      title = matches[link_type == :inline ? 5 : last_inline + 4]
      Link.new(link_type, link_text, relative_path, fragment, title)
    end

    def context
      @context ||= JekyllRelativeLinks::Context.new(site)
    end

    def markdown_extension?(extension)
      markdown_converter.matches(extension)
    end

    def markdown_converter
      @markdown_converter ||= site.find_converter_instance(CONVERTER_CLASS)
    end

    def url_for_path(path)
      path = CGI.unescape(path)
      target = potential_targets.find { |p| p.relative_path.sub(%r!\A/!, "") == path }
      relative_url(target.url) if target&.url
    end

    def potential_targets
      @potential_targets ||= site.pages + site.static_files + site.docs_to_write
    end

    def path_from_root(relative_path, url_base)
      is_absolute = relative_path.start_with? "/"

      relative_path.sub!(%r!\A/!, "")
      base = is_absolute ? "" : url_base
      absolute_path = File.expand_path(relative_path, base)
      absolute_path.sub(%r!\A#{Regexp.escape(Dir.pwd)}/!, "")
    end

    # @param link [Link] A Link object describing the markdown link to make
    def replacement_text(link)
      link.path << link.fragment if link.fragment

      if link.link_type == :inline
        "[#{link.text}](#{link.path}#{link.title})"
      else
        "\n[#{link.text}]: #{link.path}#{link.title}"
      end
    end

    def absolute_url?(string)
      return unless string

      Addressable::URI.parse(string).absolute?
    rescue Addressable::URI::InvalidURIError
      nil
    end

    def fragment?(string)
      string&.start_with?("#")
    end

    def replaceable_link?(string)
      !fragment?(string) && !absolute_url?(string)
    end

    def option(key)
      config[CONFIG_KEY] && config[CONFIG_KEY][key]
    end

    def disabled?
      option(ENABLED_KEY) == false
    end

    def collections?
      option(COLLECTIONS_KEY) == true
    end

    def excluded?(document)
      return false unless option("exclude")

      entry_filter = if document.respond_to?(:collection)
                       document.collection.entry_filter
                     else
                       global_entry_filter
                     end

      entry_filter.glob_include?(option("exclude"), document.relative_path).tap do |excluded|
        Jekyll.logger.debug(LOG_KEY, "excluded #{document.relative_path}") if excluded
      end
    end

    def global_entry_filter
      @global_entry_filter ||= Jekyll::EntryFilter.new(site)
    end

    def replace_relative_links_excerpt!(document)
      document.data["excerpt"] = Jekyll::Excerpt.new(document) if document.data["excerpt"]
    end
  end
end

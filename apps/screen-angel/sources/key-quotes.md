# aQuery: verbatim quotes

Every block below is copied mechanically out of the archived source, not retyped.
Typos and idiosyncratic spellings are Don's and are preserved (e.g. "handing events"
for "handling events" in HN 15327767, "Accesibility" in HN 9977226, "relevent" in
HN 48116547).

Sources:
  HN <id>   -> https://news.ycombinator.com/item?id=<id>
  wiki      -> https://web.archive.org/web/20180826132551/http://donhopkins.com/mediawiki/index.php/AQuery

Note on provenance: several of the strongest statements exist BOTH on the wiki page and
inside HN comments, because Don repeatedly transcluded his own wiki text into HN. Where
that is the case the source line says so. HN is now the more durable copy: the MediaWiki
install at donhopkins.com stopped serving the AQuery page between 2018-08-26 (last archived
HTTP 200) and 2018-09-27 (first archived HTTP 301), and as of 2026-09-10 that path returns
404. The static `/home/...` tree on the same host is still live; only the Drupal and
MediaWiki applications are down.


## The core definition, first public statement

Source: HN 9977226 (2015-07-30)

> aQuery -- like jQuery, but for selecting, querying and manipulating Mac app user interfaces via the Accessibility framework and protocols.


## The use cases, first public statement

Source: HN 9977226 (2015-07-30)

> So you can write jQuery-like selectors that search for and select Accessibility objects, and then it provides a convenient high level API for doing all kinds of stuff with them. So you can write higher level plugin widgets with aQuery that use HTML with jQuery, or even other types of user interfaces like voice recognition/synthesis, video tracking, augmented reality, web services, etc!


## Pie menus and a HyperCard-like builder over live Mac apps

Source: HN 9977226 (2015-07-30)

> For example, I want to click on a window and it will dynamically configure jQuery Pie Menus with the commands in the menu of a live Mac app. Or make a hypercard-like user interface builder that lets people drag buttons or commands out of Mac apps into their own stacks, and make special purpose simplified guis for controlling and integrating Mac apps.


## The Accessibility Tree as a DOM

Source: HN 9977226 (2015-07-30)

> aQuery could apply the DOM tree searching and traversal and data association stuff to the Accesibility Tree, which is similar in a lot of ways to a DOM tree, and describes all the widgets and user accessible affordances and commands in an app, as well as non-tree-like relationships between them (this label describes that widget, this tab represents that panel, this icon represents that view, this editor manipulates that object, etc).


## aQuery is not tied to jQuery; jQuery is a metaphor

Source: HN 9977226 (2015-07-30)

> I think aQuery should be independent of jQuery, but I like to use jQuery as a metaphor for how it works, even though that might suggest that it's tied to jQuery, or even HTML, which it shouldn't be.


## The hybrid thesis: scraping plus accessibility APIs

Source: HN 11520967 (2016-04-18)

> Screen scraping techniques are very powerful, but have limitations. 
> Accessibility APIs are very powerful, but have different limitations. 
> But using both approaches together, screencasting and re-composing visual elements, and tightly integrating it with JavaScript, enables a much wider and interesting range of possibilities.
>
> Think of it like augmented reality for virtualizing desktop user interfaces. The beauty of Morgan's Prefab is how it works across different platforms and web browsers, over virtual desktops, and how it can control, sample, measure, modify, augment and recompose guis of existing unmodified applications, even dynamic language translation, so they're much more accessible and easier to use!


## Cross-platform high-level widgets that wrap whole applications

Source: HN 11521683 (2016-04-18)

> The way jQuery widgets can encapsulate native and browser specific widgets with a platform agnostic api, you could develop high level aQuery widgets like "video player" that knew how to control and adapt many different video player apps across different platforms (youtube or vimeo in browser, vlc on windows or mac desktop, quicktime on mac, windows media player on windows, etc). Then you can build much higher level apps out of widgets like that.


## The implementation surface: pixel selectors plus native accessibility, in one JS engine

Source: HN 11521683 (2016-04-18)

> I'd like to integrating all those capabilities plus the native Accessibility API of each platform into a JavaScript engine, and write jQuery-like selectors for recognizing patterns of pixels and widgets, creating aQuery widgets that tracked input, drew overlays, implemented text to speech and voice control interfaces, etc.


## The tightest one-sentence definition he ever wrote

Source: HN 15327767 (2017-09-25)

> I'm proposing "aQuery", a high level scriptable accessibility tool that is to native user interface components like jQuery is to DOM, for selecting and querying components, matching visual patterns, handing events, abstracting platform dependencies and high level service interfaces, building and scripting higher level widgets and applications, etc.


## Why the accessibility API needs a jQuery

Source: HN 15327997 (2017-09-25)

> There needs to be a higher level scriptable way to get a handle on all that complexity, like jQuery helps automate the creation and manipulation and abstraction of HTML DOM and events and handlers.


## The technical design: native selector engine, async events, handlers on patterns that do not yet exist

Source: HN 15327997 (2017-09-25)

> I would try to use the native API as much as possible since they're precise yet tedious. It should have a platform-independent accessibility-specific selector language like xpath or jQuery selectors, which should be implemented efficiently in native code like querySelector. The pattern matching engine would send asynchronous events back to JavaScript. You could write JavaScript handlers for patterns of pixels as well as accessibility path patterns appearing and disappearing, like jQuery lets you bind handlers to patterns of DOM elements that don't exist yet, instead of concrete existing elements. Those handlers would create higher level widgets that could manage those existing pixels and widgets. (Like recognizing a youtube video player in any web browser window, and wrapping it in an aQuery widget implementing an abstract VideoPlayer interface, for example.)


## Scraping is the fallback, and the native API tells you where to scrape

Source: HN 15327997 (2017-09-25)

> Of course calling the native accessibility API is lighter weight than screen scraping and pixel matching, and you could use the native API to drill down to just the region of pixels you want to match or screencast, to minimize the amount of screen scraping and pixel matching required.


## The prototype: a window manager's hidden JS browser, un-hidden as a transparent overlay

Source: HN 13817649 (2017-03-08), quoting his own 2013 email to Peter Korn

> There is a window manager for the Mac called Slate, that is extensible in JavaScript -- it makes a hidden WebView and uses its JS interpreter by extending it with some interfaces to the app to do window management, using the Mac Accessibility API.
>
> So I wanted to make pie menus for it, and thought of a good approach: make the hidden WebView not so hidden, but in the topmost layer of windows, covering all the screens, with a transparent background, that shows the desktop through anywhere you don't draw html.
>
> Then just make pie menus with JavaScript, which I've done. Works like a charm!


## Where the selector engine should live

Source: HN 13817649 (2017-03-08), quoting his own email to Peter Korn

> Does that sound crazy? I think it just might work! Implement the aQuery "selector engine" and heavy lifting in Objective C so that it runs really fast, and presents a nice high level useful interface to JavaScript.


## The prototype worked, and why it stopped

Source: HN 18797587 (2018-12-31)

> It actually worked! But I didn't take it much further, because I never got any feedback on the issue I opened, so gave up on using Slate itself, and never got around to starting my own JavaScript window manager myself (like you did!). I opened my issue in June 2013, but the last commit was Feb 2013, so development must have stopped by then.


## aQuery as accessibility infrastructure, not window-manager plumbing

Source: HN 17105728 (2018-05-18)

> I have a long term pie in the sky “grand plan” about developing a JavaScript based programmable accessibility system I call “aQuery”, like “jQuery” for accessibility. It would be a great way to deeply integrate Dasher with different input devices and applications across platforms, and make them accessible to people with limited motion, as well as users of VR and AR and mobile devices.


## What Prefab lacks

Source: HN 22829690 (2020-04-10)

> Another more ambitious example is Morgan Dixon's work on Prefab, that screen-scrapes the pixels of desktop apps, and uses pattern recognition and composition to remix and modify them. This is like cinematographers finally discovering they can edit films, cut and splice shots together, overlay text and graphics and pictures-in-pictures and adjacent frames. But Prefab isn't built around a scripting language like dragonfly, NeWS or AJAX.


## The full requirements list

Source: HN 29105919 (2021-11-04)

> >And this is why a modern window manager should be written in JavaScript, leverage HTML, Canvas and WebGL, and support Accessibility APIs, as well as screen scraping, pattern recognition, screen casting, virtual desktops, overlays, drawing and image composition, input event synthesis, journaling, macros, runtime user customization and scripting, programming by demonstration, tabbed windows, pie menus, etc:


## The LLM-era reframing of Prefab

Source: HN 48116547 (2026-05-13)

> I've written more about Morgan Dixon's work on Prefab (pre-LLM pattern recognition, which is much more relevent with LLMs now).


## The naming sentence, from the wiki page itself

Source: wiki AQuery (capture 2018-08-26)

> So what we need is "aQuery", which is like jQuery for accessibility.


## The Accessibility API is too low level

Source: wiki AQuery (capture 2018-08-26)

> The Accessibility API on the Mac is very low level, like DOM. It needs a higher level API that's much easier to program, for searching, selecting, querying, manipulating, and tracking events on accessible user interface objects in desktop apps.


## Cross-platform ambition

Source: wiki AQuery (capture 2018-08-26)

> aQuery could even present a uniform API for several different accessibility APIs on different platforms (though that is a lot more ambitious -- I'd like to just do it on Macs to prove the idea first, and then iterate towards taking over the whole world).


## Why the jQuery framing, stated outright

Source: wiki AQuery (capture 2018-08-26)

> aQuery would be a counterpart to something like jQuery (of course it should be independent of jQuery so you can use any web toolkit you want, but jQuery is a great metaphor to think about and explain aQuery, and a great extensible architecture, and social lubricant for educating and recruiting and leveraging the huge community of jQuery programmers).


## aQuery plug-ins and aQuery UI

Source: wiki AQuery (capture 2018-08-26)

> The way jQuery has a convenient and powerful API that insulates you from browser incompatibilities, and has jQuery UI built on top of it, to make a standard set of high level widgets, you could build aQuery extensions with simple high level APIs to all that low level accessibility stuff, and aQuery UI + jQuery UI widgets and user interfaces that made it easy to do particular useful tasks with common apps and user interface cliches!


## The thesis sentence: fix apps from outside, without modifying them

Source: wiki AQuery (capture 2018-08-26)

> aQuery would allow us to fix and script and extend and customize existing apps that have shitty user interfaces, from outside, without modifying the apps!


## Recursion onto web browsers

Source: wiki AQuery (capture 2018-08-26)

> Of course the aQuery/jQuery UIs should be accessible themselves, since they're built with HTML and accessible libraries like jQuery UI (FWTW), so it should be able to dovetail recursively to control itself of course. It would be a terrible design flaw if it couldn't! ;) (Not that you'd need to do that all the time, but that it should have kick-ass support for manipulating web browsers and accessible html content, and making shitty web pages even more accessible.)


## Fragility, and why you must query rather than hold pointers

Source: wiki AQuery (capture 2018-08-26)

> The point you raise about interfaces being fragile is important. So it's important to have a dynamic query and binding ability, and not just drilling down and using pointers or ids of individual objects, because user interfaces change so dynamically and unpredictably.
>
> aQuery must be able to search for things in many ways, even including visual search and graphical screen scraping and pattern recognition.


## Live screencasting, not just static scraping

Source: wiki AQuery (capture 2018-08-26)

> Beyond screen scraping static images, it would also be useful to have a scriptable real time "screencasting" ability to take live views of parts of an application and project them into your custom user interface as static graphics or real time views (like taking the video from skype and sucking it into a 3D environment or 2d hyperlook stack, while totally controlling skype's user interface and the chat window, with scriptable speech recognition and text to speech), or searching the user interface for patterns like cursors or frame corners, and reading the pixels inside them, recognizing text, icons, faces, etc (for controlling online games, like a WOW or Zynga robot might do). You could even pass mouse and keyboard events through your views into the applications, like "vnc", or provide alternative user interfaces for them (hiding them off the screen but somehow reading the pixels they're drawing into their offscreen windows).


## Ben Shneiderman's reply, which locates the key idea in the text

Source: wiki AQuery (capture 2018-08-26)

> Your idea of developing an “aQuery” library of accessibility widgets is an interesting one.  I’m copying to some colleagues who might know about similar projects or who to pass this on to.  (For their info, Don is a UMd grad, super-programmer, creator of pie menus and much more including a key person on The Sims).


## Blair MacIntyre's reply: the fragility objection and the AR angle

Source: wiki AQuery (capture 2018-08-26)

> I do worry that UIs built this way would be fragile as applications were updated (and thus frustrating for users).  If it was possible for developers (the people providing UI templates built with the system for others to use) to easily keep their stuff working with many versions of these apps (e.g., my VLC ui would work with a bunch of different versions of VLC), that would be important.   Or build libraries of capabilities (to play a video, we can use one of these 3 apps, here's the layer for each one).


## James Landay's reply, which is how Prefab entered the story

Source: wiki AQuery (capture 2018-08-26)

> This is right up the alley of UW CSE grad student Morgan Dixon.  You might want to also look at his papers.


## The Prefab integration proposal, verbatim

Source: wiki AQuery (capture 2018-08-26), also HN 11520967 / 18797818 / 22829690

> I would like to discuss how we could integrate Prefab with a Javascriptable, extensible API like aQuery, so you could write "selectors" that used prefab's pattern recognition techniques, bind those to JavaScript event handlers, and write high level widgets on top of that in JavaScript, and implement the graphical overlays and gui enhancements in HTML/Canvas/etc like I've done with Slate and the WebView overlay.


## Drag controls out of live applications

Source: wiki AQuery (capture 2018-08-26)

> Users could literally drag controls out of live applications, plug them together into their own "stacks", configure and train and graphically customize them, and hook them together with other desktop apps, web apps and services!


## The pie menu built from a live app's own slider

Source: wiki AQuery (capture 2018-08-26)

> For example, I'd like to make a direct manipulation pie menu editor, that let you just drag controls out of apps and drop them into your own pie menus, that you can inject into any application, or use in your own guis.
> If you dragged a slider out of an app into the slice of a pie menu, it could rotate it around to the slice direction, so that the distance you moved from the menu center controlled the slider!

# aQuery — Like jQuery for Accessibility

*The email thread where aQuery was named, ~2013. Recovered from the Wayback Machine capture of
`donhopkins.com/mediawiki/index.php/AQuery` dated 2018-08-26, cross-checked against the
2017-01-03 capture — the aQuery text is identical between them, only the Prefab links differ.
The wiki is gone; the static `donhopkins.com/home/` tree those links point into is still live.*

*Text is Don's and his correspondents', verbatim, including typos. Only the MediaWiki table of
contents was removed. The thread runs: Don asks Peter Korn → Korn replies → Don's wall of text
(the one that names aQuery) → Jonathan Payne → Ben Shneiderman, who forwards it to colleagues →
Blair MacIntyre → Don's reply to MacIntyre (the most technical part) → James Landay, who points
at Morgan Dixon → Don's email to Dixon.*

---

## aQuery -- Like jQuery for Accessibility

I asked [Peter Korn](http://peterkorn.wordpress.com/) ([previously](https://blogs.oracle.com/korn/)):

#### Don asks Peter Korn:

Hey I would love to bounce an idea off of you! I didn't realize how much [work you've done in accessibility](https://plus.google.com/109915568489541328254/posts/PLKxjRbJjYV).

There is a window manager for the Mac called [Slate](https://github.com/jigish/slate), that is extensible in JavaScript -- it makes a hidden WebView and uses its JS interpreter by extending it with some interfaces to the app to do window management, using the Mac Accessibility API.

So I wanted to make pie menus for it, and thought of a good approach: make the hidden WebView not so hidden, but in the topmost layer of windows, covering all the screens, with a transparent background, that shows the desktop through anywhere you don't draw html.

Then just make pie menus with JavaScript, which I've done. Works like a charm!

THEN the next step I would like to do is this:

aQuery -- like [jQuery](http://jquery.com/), but for selecting, querying and manipulating Mac app user interfaces via the [Accessibility framework](https://developer.apple.com/library/mac/documentation/cocoa/Conceptual/Accessibility/cocoaAXIntro/cocoaAXintro.html) and [protocols](https://developer.apple.com/library/mac/documentation/Accessibility/Conceptual/AccessibilityMacOSX/OSXAXModel/OSXAXmodel.html).

So you can write [jQuery-like selectors](http://api.jquery.com/category/selectors/) that search for and select [Accessibility objects](https://developer.apple.com/library/mac/documentation/Accessibility/Conceptual/AccessibilityMacOSX/OSXAXModel/OSXAXmodel.html#//apple_ref/doc/uid/TP40001078-CH208-BEIGFFHE), and then it provides a [convenient high level API](http://api.jquery.com/) for doing all kinds of stuff with them. So you can write [higher level plugin widgets](http://plugins.jquery.com/) with aQuery that use HTML with jQuery, or even other types of user interfaces like voice recognition/synthesis, video tracking, augmented reality, web services, etc!

For example, I want to click on a window and it will dynamically configure [jQuery Pie Menus](2013-jquery-pie-menus.md) with the commands in the menu of a live Mac app. Or make a [hypercard](http://api.jquery.com/category/selectors/)-like user interface builder that lets people drag buttons or commands out of Mac apps into their own stacks, and make special purpose simplified guis for controlling and integrating Mac apps.

Does that sound crazy? I think it just might work!  Implement the aQuery "selector engine" and heavy lifting in Objective C so that it runs really fast, and presents a nice high level useful interface to JavaScript.

[Here is an issue I opened about it on the Slate github page](https://github.com/jigish/slate/issues/322), describing what I've done, but I haven't written up the "aQuery" idea yet. That's the next step!

#### Peter Korn replies:

Short answer: sounds quite do-able.  Long answer: I've got a LOT more information for you on this, mostly general (not MacOS-specific), which is better suited to e-mail I think.  Can we shift this conversation to that medium?

#### Don emails Peter Korn:

I'd love to hear everything you've got to give me about accessibility, and discuss this further with you!

Here is a wall of text to explain what I've been thinking about.

First, a quick sketch of the background that's led me to this:

One thing I've always wanted to do, is to inject [pie menus](https://en.wikipedia.org/wiki/Pie_menu) into unsuspecting programs and web sites, like it was once possible with [NeWS](https://en.wikipedia.org/wiki/NeWS). But also, much more!

In the 80's, I started developing pie menus in the [X10 window system](https://en.wikipedia.org/wiki/X_Window_System#Origin_and_early_development).

The first thing I did was to make a [little test program](http://www.donhopkins.com/home/pub/piemenus/theta-menus/) to see if the basic idea worked, and it did. But I needed a way for users to define their own, and something useful to do with them.

So I took the [X10 "uwm" window manager](http://www.donhopkins.com/home/archive/piemenu/uwm/), which had a [.uwmrc file](http://www.donhopkins.com/home/archive/piemenu/uwm1/default.uwmrc) that let you define your own menus and submenus that performed window management commands and launched Unix processes. I modified it so you could define your own pie menus as well as the standard linear menus in the [pie-ified .uwmrc file](http://www.donhopkins.com/home/pub/piemenus/pietest/.uwmrc). And that worked very well!

Jack Callahan was taking an HCI course from [Ben Shneiderman](https://en.wikipedia.org/wiki/Ben_Shneiderman), and he decided to do his project on evaluating pie menus. So he needed [a flexible system for performing an experiment and measuring the results](http://www.donhopkins.com/home/pub/piemenus/pietest/). (The results were great: pie menus are faster and have lower error rates than linear menus, and I've been developing the idea for many years, using them in many apps like [Emacs](https://en.wikipedia.org/wiki/File:HyperTIESAuthoring.jpg) and [window managers](http://www.art.net/~hopkins/Don/piemenus/ddj/piemenus.html), and games like [SimCity](http://micropolisonline.com/static/documentation/images/SimCity_HyperLook.gif) and [The Sims](http://www.donhopkins.com/home/catalog/piemenus/sims-shadowed-pie.jpg).)

I was using [Mitch Bradley's](https://en.wikipedia.org/wiki/Mitch_Bradley) [Sun Forth system (which evolved into Open Firmware)](https://en.wikipedia.org/wiki/Open_Firmware), which was capable of [linking in and calling C code](http://www.donhopkins.com/home/pub/piemenus/pietest/load-fuwm.f) and [wrapping C structures](http://www.donhopkins.com/home/pub/piemenus/pietest/Xlib.f), so I cracked UWM open so it had some [useful hooks and entry points](http://www.donhopkins.com/home/pub/piemenus/pietest/Forth.c), and [rewrote the main loop in Forth](http://www.donhopkins.com/home/pub/piemenus/pietest/fuwm-main.f), so you could [script the pie menu tracking code in Forth](http://www.donhopkins.com/home/pub/piemenus/pietest/uwm.f), and do all kinds of other cool stuff, specifically prompt the user what to do, pop up [specific menus, either pies or linear](http://www.donhopkins.com/home/pub/piemenus/pietest/testmenus), [randomize and sequence the menus](http://www.donhopkins.com/home/pub/piemenus/pietest/menulist.f), measure the selection time and error rate, and write the data out to [files for analysis](http://www.donhopkins.com/home/pub/piemenus/callahan/piemenudata/), so Jack could use it to perform his experiment. We published [a paper about it at CHI'88](http://www.donhopkins.com/drupal/node/100).

Then I ran across [James Gosling's](https://en.wikipedia.org/wiki/James_Gosling) [NeWS window system](https://en.wikipedia.org/wiki/NeWS), learned [PostScript http://www.donhopkins.com/drupal/node/97], and implemented [pie menus](http://www.donhopkins.com/home/pub/piemenus/NeWS-1.1/piemenu-ps-for-NeWS-first-release.txt) and a [pie menu window manager](http://www.donhopkins.com/home/pub/piemenus/NeWS-1.1/neatwin-ps-for-NeWS-first-release.txt) for NeWS.

Note the parallel between the uwm window manager scripted in Forth, and the NeWS window manager scripted in PostScript... and a web based window manager scripted in JavaScript!

The nice thing about NeWS is that the window manager is just part of the user interface toolkit, it all runs in the server (essentially "AJAX", but with PostScript instead of HTML/CSS for drawing, PostScript instead of XML/JSON for data, and PostScript instead of JavaScript for programming). You could subclass window frames and menus to extend and redefine their behavior.

So I made pie menus for [window management](http://www.donhopkins.com/drupal/node/98), for launching applications, for the [HyperTIES](http://www.donhopkins.com/drupal/node/101) hypermedia [browser](http://www.youtube.com/watch?v=fZi4gUjaGAM) and [authoring tool](http://www.youtube.com/watch?v=hhmU2B79EDU) we were developing at [HCIL](http://www.cs.umd.edu/hcil/), for [controlling Emacs](https://en.wikipedia.org/wiki/File:HyperTIESAuthoring.jpg), for [selecting fonts and colors, and all kinds of other things](http://www.vimeo.com/61556918?t=25m37s).  You could set the default menu class to pie menus, and all NeWS apps would get pie menus!

Then I ran out and bought [HyperCard](https://en.wikipedia.org/wiki/HyperCard) for $35 when it first came out, and it blew my mind. There's STILL nothing like it. But we eventually developed something even better than HyperCard for NeWS!

Arthur van Hoff (who later wrote AWT (please forgive him for that!), the Java compiler in Java, Marima Castanet and Bongo, Flipboard, etc) had before that written the coolest thing that ever existed for NeWS, called GoodNeWS, nee HyperNeWS, nee HyperLook, which was like HyperCard written in and rendered with PostScript, with client/server networking (something HyperCard forgot), and user editable structured PostScript graphics (instead of black and white pixels).

It had used editable "stacks" with "backgrounds" and "cards" and "objects", message passing, object/card/background/stack/network client delegation, property sheets for editing object properties, script editors for editing object behaviors, warehouses of pre-configured objects users could copy and paste and customize and script into their own stacks, a PostScript graphics editor component, and HyperLook's own property sheets were defined in terms of its own stacks that you could edit and create your own -- unlike HyperCard which wasn't good enough to do its own authoring tool user interface with, and just used standard immutable Mac dialogs for that!

So I went to Sun to work on NeWS, and we had a war with the X11 people about who was going to manage windows, X11 or NeWS. We wrote a wonderful proof-of-concept-but-totally-usable window manager in NeWS that had pie menus, tabbed frames, scrolling virtual desktop, rooms, wrapped X-windows with all those great features, and was very fast and never dropped events on the ground or got constipated, slowed down, froze up, forgot what you told it to do, and then took a giant crap on your screen like asynchronous outboard X11 ICCCM window managers did (and still do).

You could (get this) actually (drumroll) pin a menu WITHOUT it disappearing from the screen and then shortly thereafter reappear nearby but never in the same location, at a slightly different size, with a totally different frame around it!!!

When I demonstrated my overhaul of the NeWS OPEN LOOK pinned menus to a co-worker, I said "watch this" (always a dangerous thing to say in a demo), and I pinned a menu, and NOTHING HAPPENED -- it just SAT THERE ON THE SCREEN AFTER I PINNED IT WITHOUT CHANGING! They actually though it was broken because they were so used to all the flickering and huffing and puffing you always got when you pinned an X11 menu, that they assumed the flickering and moving and changing must have been part of the OPEN LOOK spec, and the definition of what it meant to pin a menu! The NeWS menu class just subclassed the window frame and built on top of that, so there was no need for all the ridiculous bullshit that you had to do to pin a menu under X11.

But we lost the window management war (although we learned a lot along the way). They wanted us to put NeWS windows inside of X11 window frames, so we would lose the nice window management features, extensibility, customizable user interfaces, pie menus, tabbed window frames, arbitrarily shaped windows (the ICCCM and X11 SHAPES extension just did't cut it). Eyeballs that follow the cursor were not meant to be framed in square windows like XEyes.

So I said FUCK THIS and left Sun, and went to Scotland to port SimCity to Unix and work with Arthur at Turing on HyperLook (the new version of HyperNeWS). I shipped SimCity on HyperLook to prove that HyperLook and pie menus were good enough to make a real game. Then Sun canceled NeWS out from under us right after we shipped. But we still learned a lot from the experience!

What we really wanted to do before I left Sun was to hire Arthur van Hoff away from the Turing Institute and make an awesome window manager out of HyperLook, that let users totally customize their window frames, and even plug multiple X or NeWS apps together into stacks and integrate them by scripting with PostScript (or PdB, an object oriented C-like syntax for PostScript for which Arthur wrote a compiler -- PdB stands for a Glaswegian expression: Pure dead Brilliant).

But that never happened. But it COULD happen now, much better, with a web based window manager using the accessibility API to integrate applications! But the term "window manager" does not really do it justice. I need a better way to describe it.

So fast forward to today: I've written pie menus for jQuery. Now I want to write something like HyperLook that is like HyperCard for HTML/JavaScript, and then use that to let users define their own pie menus, build their own stacks, and make applications and user interfaces for anything, including but not limited to using it to manage native windows and integrate native apps (this could theoretically be done for Mac, Windows, X11 or whatever, but I'd like to do it for the Mac for now, just to bootstrap and prove the concept).

I've been playing around with the Mac Slate window manager, making its WebView visible but transparent, and overlaying it in the topmost layer above all screens, so any html content you create is visible and catches mouse events, but mouse clicks pass through transparent areas to apps on the desktop. So then Slate can track and control the windows, and overlay HTML widgetry on top of their frames or user interfaces, next to their frames (like tabs that popped up pie menus and let you slide tiling windows around), or in a totally different independent html "remote control" window, and those html interfaces can use the Accessibility API to control native apps.

So what we need is "aQuery", which is like jQuery for accessibility.

The Accessibility API on the Mac is very low level, like DOM. It needs a higher level API that's much easier to program, for searching, selecting, querying, manipulating, and tracking events on accessible user interface objects in desktop apps.

aQuery could even present a uniform API for several different accessibility APIs on different platforms (though that is a lot more ambitious -- I'd like to just do it on Macs to prove the idea first, and then iterate towards taking over the whole world).

aQuery would be a counterpart to something like jQuery (of course it should be independent of jQuery so you can use any web toolkit you want, but jQuery is a great metaphor to think about and explain aQuery, and a great extensible architecture, and social lubricant for educating and recruiting and leveraging the huge community of jQuery programmers).

This brings us to aQuery plug-ins! It should be possible to write special purpose (or general purpose) aQuery extensions for manipulating particular applications, or just window frames or common controls in general.

The way jQuery has a convenient and powerful API that insulates you from browser incompatibilities, and has jQuery UI built on top of it, to make a standard set of high level widgets, you could build aQuery extensions with simple high level APIs to all that low level accessibility stuff, and aQuery UI + jQuery UI widgets and user interfaces that made it easy to do particular useful tasks with common apps and user interface cliches!

For example: a set of "remote control" buttons, time shuttles, speed and volume controls, etc, for the VLC video player, which has wonderful features but one of the worst user interfaces in the world.

We can just make great user interfaces for it that expose VLC's wonderful features, and focus on particular use cases!

aQuery would allow us to fix and script and extend and customize existing apps that have shitty user interfaces, from outside, without modifying the apps!

And it could be used to make UIs that catered to people with particular disabilities for apps that themselves weren't easy enough to use.

Of course the aQuery/jQuery UIs should be accessible themselves, since they're built with HTML and accessible libraries like jQuery UI (FWTW), so it should be able to dovetail recursively to control itself of course. It would be a terrible design flaw if it couldn't! ;) (Not that you'd need to do that all the time, but that it should have kick-ass support for manipulating web browsers and accessible html content, and making shitty web pages even more accessible.)

So then once you have a nice library of aQuery plugins that present nice high level user interfaces for controlling particular applications, and presenting a uniform API for controlling related applications, like (AND MOST IMPORTANTLY) **WEB BROWSERS** (that's how it recurses on itself), you can start writing high level task specific user customizable user interfaces for all kinds of different programs, and integrate multiple programs together into one simple user interface, for a particular task, or to support a particular kind of disability (sorry if that's a politically incorrect term but you know what I mean).

The idea is that it should be possible to build ON TOP of existing applications, and make custom UIs for particular tasks or types of users.

#### Jonathan Payne replies:

Maybe you should start with zeptos instead of jquery. jquery is huge because it supports IE from 10 years ago.

I haven't heard of anything like this. I don't know much about how accessibility works in browsers.

Good luck!

JP

#### Ben Shneiderman replies:

HI Don,

Your idea of developing an “aQuery” library of accessibility widgets is an interesting one.  I’m copying to some colleagues who might know about similar projects or who to pass this on to.  (For their info, Don is a UMd grad, super-programmer, creator of pie menus and much more including a key person on The Sims).

(you can read all of Don’s story, but the key idea begins at “So what we need is "aQuery", which is like jQuery for accessibility.”)

Let’s see what they say… Best wishes… Ben

#### Blair MacIntyre replies:

Hi Don,

I'm not aware of anyone doing that sort of thing, but I'm not active in that area right now;  my impression is that "window management" kinds of work have really become less popular (at least in research circles) as the predominant OSs have become more monolithic (MacOS, Windows).   But, that may just be me not noticing (I wasn't aware of Mac Slate, or many of the other kinds of Mac UI extensions ... I have used a few but mostly they don't do enough stuff, due to the limitations of what you can do with the mac UI, to make it worth learning and configuring them).

So, that said, having a framework that supports more dramatic UI changes/extensions would be super useful.

I do worry that UIs built this way would be fragile as applications were updated (and thus frustrating for users).  If it was possible for developers (the people providing UI templates built with the system for others to use) to easily keep their stuff working with many versions of these apps (e.g., my VLC ui would work with a bunch of different versions of VLC), that would be important.   Or build libraries of capabilities (to play a video, we can use one of these 3 apps, here's the layer for each one).

I've been think about managing HTML/CSS content lately from an AR viewpoint in our Argon system (one of my students is reviving my old idea for "augmentation management" in the web context, and another is working on a 3D UI toolkit for web-based AR content), but hadn't really thought of leveraging the accessibility APIs, which we'll look into (thanks!) ... but, our context of use is different (not desktop, but 3D AR UIs).   Although you are making me think about the intersection of the two (basically, doing our old "Windows on the World" system, that was hacked into X, but with Web content).

Clearly, for me, an aQuery kind of layer that made it easier for us to inspect and manage nuggets of web content across different platforms would be useful.  I wouldn't need it on the desktop (any time soon), so I'm not sure what that means.

Good to hear from you!  It was interesting to read that history, brings back memories ... :)

#### Don replies to Blair MacIntyre:

Wow Blair, you have given me a useful perspective: how can aQuery be used for all kinds of different user interfaces, like AR, speech recognition, etc, not just html?

What you want to do is to deeply integrate AR user interfaces with existing apps!

There are other things that I want to do that build on top of aQuery (hyperlook, pie menus, etc) that use more traditional 2d user interfaces that you can support with jQuery/HTML/CSS, etc, but I'm also interested in speech recognition, AR, video tracking, and other stuff like that.

I think aQuery should be independent of jQuery, but I like to use jQuery as a metaphor for how it works, even though that might suggest that it's tied to jQuery, or even HTML, which it shouldn't be.

It could be implemented by hosting the WebView with a JavaScript interpreter in a native Mac app (that's what Slate does), and exposing the app's Objective C objects and methods to JavaScript through an interface that lets you use Objective C methods and properties from JavaScript. (Apple provides a simple one, and there are even more sophisticated bridges like jscocoa that let you dynamically wrap and call all kinds of native objects and apis using runtime type information).

I think the way to go is to implement most of the heavy lifting parts of aQuery in Objective C (or whatever the native platform is) so it can efficiently query and traverse objects, bind and handle events, and do other common tasks etc, without any JS interpreter overhead. Much in the way jQuery tries to use the browser's built-in css selector engine (getElementsByClassName, querySelector, querySelectorAll), but falls back to one written in JavaScript (Sizzle) only if necessary.

To get a concrete idea of what the Mac Accessibility API exposes, check out the Accessibility Inspector that you can run from X-Code's XCode=>Open Developer Tools=>Accessibility Inspector menu, and the iOS Simulator Accessibility Inspector:

https://developer.apple.com/library/mac/documentation/Accessibility/Conceptual/AccessibilityMacOSX/OSXAXTesting/OSXAXTestingApps.html
http://www.youtube.com/watch?v=rg9Rn3fidGc

I think it's a good idea to look into how you can apply existing web technologies like CSS and DOM and jQuery to AR and to aQuery.

jQuery does a lot of stuff with CSS, that you could apply to 3D rendering styles and other AR properties you want to configure.

The Mac's accessibility API has properties on a tree of objects, but nothing like CSS classes, and you can't directly mutate properties or structures, since that's up to the app (but you can manipulate the app into doing that, of course).

jQuery also does a lot of stuff with the DOM, including searching, traversing, querying, manipulating, and very importantly event handling, and at a higher level, associating JavaScript data with DOM objects, in the service of handling events and supporting jQuery extensions, like creating "widgets" -- JavaScript objects that bring DOM elements to life, possibly creating more DOM sub-lements and jQuery objects.

aQuery could apply the DOM tree searching and traversal and data association stuff to the Accesibility Tree, which is similar in a lot of ways to a DOM tree, and describes all the widgets and user accessible affordances and commands in an app, as well as non-tree-like relationships between them (this label describes that widget, this tab represents that panel, this icon represents that view, this editor manipulates that object, etc).

jQuery has a lot of great event handling stuff, and that is very important for aQuery (and for AR as well), since you need to be able to bind handlers to events, watch for properties on objects changing, watch for objects matching patterns being created and destroyed, and create and destroy higher level aQuery UI widgets to integrate apps with alternative user interfaces.

jQuery has a newer more efficient and powerful way to binding event handlers to jQuery patterns that let you bind handlers that match DOM objects that do not yet exist.

In order to implement that efficiently, jQuery handles events on the document root before they trickle down to individual leaf elements, which vastly reduces the number of event handler bindings and ping-ponging, and lets your bindings apply to dynamically created HTML that did not exist when you bound the events, that you can select with all kinds of handy jQuery selectors (not just an id or class or path pointing down into the hierarchy to a particular object, but full pattern matching with jQuery selectors).

aQuery should provide ways of registering patterns and calling handlers when user interface items that match them are created and destroyed. jQuery doesn't directly provide a way to do that (handling page onload events and XHR request responses is usually sufficient), but of course there is a jQuery plug-in that does it: https://code.google.com/p/mutation-summary/ .

So when some user interface objects you're interested in controlling come into existence, you can wrap them with your own "widget" to glue them into whatever other user interface you want to provide. (pie menus, hyperlook, ar, speech recognition, etc).

The point you raise about interfaces being fragile is important. So it's important to have a dynamic query and binding ability, and not just drilling down and using pointers or ids of individual objects, because user interfaces change so dynamically and unpredictably.

aQuery must be able to search for things in many ways, even including visual search and graphical screen scraping and pattern recognition.

See Rich Potter's article Triggers: Guiding Automation with Pixels to Achieve Data Access in the book "Watch What I DO: Programming by Demonstration".
http://books.google.nl/books?id=Ggzjo0-W1y0C&printsec=frontcover&dq=isbn:0262032139&hl=en&sa=X&ei=7rZrUsS3L-Px4gT414HYAw&redir_esc=y#v=onepage&q&f=false

And Scott Kim's thesis "Viewpoint":
http://scottkim.com/viewpoint/
http://scottkim.com/viewpoint/viewpoint-dissertation.pdf
http://www.youtube.com/watch?v=9G0r7jL3xl8

Of course screen scraping should be a last resort for applications that don't provide all you need to know through the standard accessibility APIs (Mac Cocoa and iOS guis make that easy to do), but it's very powerful, and there are a lot of interesting things you can do with it.

Beyond screen scraping static images, it would also be useful to have a scriptable real time "screencasting" ability to take live views of parts of an application and project them into your custom user interface as static graphics or real time views (like taking the video from skype and sucking it into a 3D environment or 2d hyperlook stack, while totally controlling skype's user interface and the chat window, with scriptable speech recognition and text to speech), or searching the user interface for patterns like cursors or frame corners, and reading the pixels inside them, recognizing text, icons, faces, etc (for controlling online games, like a WOW or Zynga robot might do). You could even pass mouse and keyboard events through your views into the applications, like "vnc", or provide alternative user interfaces for them (hiding them off the screen but somehow reading the pixels they're drawing into their offscreen windows).

It should be useful for writing screen scrapers for many tasks, from robots for playing online poker games, to "continuous integration" user interface testing and validation frameworks.

It would also be great to expose the speech recognition and synthesis APIs, and make it possible to write all kinds of intelligent speech driven guis, bots, etc.

Take a look at what the Dragon Naturally Speaking community has done with Python, to control many different apps with speech -- it even has "command module repository" of plug-ins for integrating particular applications!

https://code.google.com/p/dragonfly/
http://dragonfly-modules.googlecode.com/svn/trunk/command-modules/documentation/index.html

-Don

#### James Landay replies:

Don,

This is right up the alley of UW CSE grad student Morgan Dixon.  You might want to also look at his papers.

#### Don emails Morgan Dixon:

Morgan, your work is brilliant, and it really impresses me how far you've gone with it, how well it works, and how many things you can do with it!

I checked out your web site and videos, and they provoked a lot of thought so I have lots of questions and comments.

I really like the UI Customization stuff, and also the sideviews!

Combining your work with everything you can do with native accessibility APIs, in an HTML/JavaScript based, user-customizable, scriptable, cross platform user interface builder like (but transcending) HyperCard would be awesome!

I would like to discuss how we could integrate Prefab with a Javascriptable, extensible API like aQuery, so you could write "selectors" that used prefab's pattern recognition techniques, bind those to JavaScript event handlers, and write high level widgets on top of that in JavaScript, and implement the graphical overlays and gui enhancements in HTML/Canvas/etc like I've done with Slate and the WebView overlay.

Users could literally drag controls out of live applications, plug them together into their own "stacks", configure and train and graphically customize them, and hook them together with other desktop apps, web apps and services!

For example, I'd like to make a direct manipulation pie menu editor, that let you just drag controls out of apps and drop them into your own pie menus, that you can inject into any application, or use in your own guis.
If you dragged a slider out of an app into the slice of a pie menu, it could rotate it around to the slice direction, so that the distance you moved from the menu center controlled the slider!

While I'm at it, here's some stuff I'm writing about the [jQuery Pie Menus](2013-jquery-pie-menus.md).

[Web Site: Morgan Dixon's Home Page.](http://morgandixon.net/)

[Web Site: Prefab: The Pixel-Based Reverse Engineering Toolkit.](https://prefab.github.io)

[Video: Prefab: What if We Could Modify Any Interface?](http://www.youtube.com/watch?v=lju6IIteg9Q)

Imagine if every interface was open source. Any of us could modify the software we use every day. Unfortunately, we don't have the source.

Prefab realizes this vision using only the pixels of everyday interfaces. This video shows the use of Prefab to add new functionality to Adobe Photoshop, Apple iTunes, and Microsoft Windows Media Player. Prefab represents a new approach to deploying HCI research in everyday software, and is also the first step toward a future where anybody can modify any interface.

Presented by Morgan Dixon and James Fogarty at CHI 2010.

[PDF: A General-Purpose Target-Aware Pointing Enhancement Using Pixel-Level Analysis of Graphical Interfaces.](https://homes.cs.washington.edu/~jfogarty/publications/chi2012-prefab.pdf)
Morgan Dixon, James Fogarty, and Jacob O. Wobbrock. (2012).
Proceedings of the SIGCHI Conference on Human Factors in Computing Systems.
CHI '12. ACM, New York, NY, 3167-3176. 23%.

[Video: Content and Hierarchy in Prefab.](http://www.youtube.com/watch?v=w4S5ZtnaUKE)

Imagine if every interface was open source. Any of us could modify the software we use every day. Unfortunately, we don't have the source.

Prefab realizes this vision using only the pixels of everyday interfaces. This video shows how we advanced the capabilities of Prefab to understand interface content and hierarchy. We use Prefab to add new functionality to Microsoft Word, Skype, and Google Chrome. These demonstrations show how Prefab can be used to translate the language of interfaces, add tutorials to interfaces, and add or remove content from interfaces solely from their pixels. Prefab represents a new approach to deploying HCI research in everyday software, and is also the first step toward a future where anybody can modify any interface.

[PDF: Content and Hierarchy in Pixel-Based Methods for Reverse-Engineering Interface Structure.](http://homes.cs.washington.edu/~jfogarty/publications/chi2011.pdf)
Morgan Dixon, Daniel Leventhal, and James Fogarty. (2011).
Proceedings of the SIGCHI Conference on Human Factors in Computing Systems.
CHI '11. ACM, New York, NY, 969-978. 26%.

[Video: A General-Purpose Bubble Cursor.](http://www.youtube.com/watch?v=46EopD_2K_4)

We present a general-purpose implementation of Grossman and Balakrishnan's Bubble Cursor (http://www.tovigrossman.com/BubbleCursor/), the fastest general pointing facilitation technique in the literature. Our implementation functions with any application on the Windows 7 desktop. Our implementation functions across this infinite range of applications by analyzing pixels and by leveraging human corrections when it fails.

[PDF: Prefab: Implementing Advanced Behaviors Using Pixel-Based Reverse Engineering of Interface Structure.](https://redesign.cs.washington.edu/sites/default/files/hci/papers/CHI2009-Prefab-Final.pdf)
Morgan Dixon and James Fogarty. (2010).
Proceedings of the SIGCHI Conference on Human Factors in Computing Systems.
CHI '10. ACM, New York, NY, 1525-1534. 22%

[PDF: Prefab: What if Every GUI Were Open-Source?](https://homes.cs.washington.edu/~jfogarty/publications/workshop-chi2010.pdf)
Morgan Dixon and James Fogarty. (2010).
Proceedings of the SIGCHI Conference on Human Factors in Computing Systems.
CHI '10. ACM, New York, NY, 851-854.

"Abstract: Current methods for implementing graphical user interfaces create fundamental challenges for HCI research and practice. Researchers are often unable to demonstrate or evaluate new techniques beyond small toy applications, and practitioners are often unable to adopt methods from the literature in new and existing applications. This position statement examines a vision in which anybody can modify any GUI of any application, similar to a scenario where every GUI of every application is open-source. We are currently working to enable this vision through our development of Prefab, using pixel-based interpretation of GUIs to enable modification of those GUIs without any cooperation from the underlying application. We see participation in the FLOSS HCI workshop as valuable in at least two regards. First, fully realizing this vision will likely require a community-based approach, so we are interested in Prefab as a platform for collaboration between HCI researchers and the FLOSS community. Second, enabling arbitrary modification of any GUI would seem to blur many current distinctions between open and closed applications, introducing new research questions and further magnifying the importance of the workshop’s focus."

# XML Pie Menus

*Thursday, February 5, 2004*

Pie menus documentation hub (referenced in post): https://web.archive.org/web/20040317155006/http://www.piemenu.com/JavaScriptPieMenus.html  

Chris, a computer science student from [digipen.edu](https://web.archive.org/web/20040317155006/http://digipen.edu/) who's interested in user interface design, asked me some interesting questions about pie menus:

> First, were you happy with The Sims' implementation of pie menus? It seems as though it doesn't necessarily provide all of the great features of an ideal pie. The targets aren't infinitely 'deep' -- the user needs to click directly on the button. Perhaps more importantly, the targets aren't in predictable locations (they items are dynamic based on a very complex set of inputs.) Don't misunderstand; I loved the game and felt the the interface worked well. I am interested in the design decisions that were made.
>
> The other thing I wanted ato ask was, have you any opinions on the game Sacrifice? I was very drawn to its pie system, and am always surprised that there has really never been much mention of it when it comes to discussion of pies, and pies in games. Thank you for your time,
>
> Chris

Thanks for your thoughtful questions!

I'm glad to hear [fasteroids](https://web.archive.org/web/20040317155006/http://www.piemenu.com/fasteroids.html) still works after all those internet explorer patches that have come out since I wrote it. I hope the Eloas patent doesn't force Microsoft to break browser plug-ins like fasteroids and pie menus on purpose.

I'm pretty happy with the way [The Sims pie menus](https://web.archive.org/web/20040317155006/http://www.piemenu.com/) turned out, considering the time and design constraints. But of course there are several things about them I would change and extend if I had the time.

Each time I've implement pie menus for different systems, I've taken different approaches, depending on the needs of the application and the capabilities of the platform.

For a game like The Sims, the game design was primary and everything flows from that. So the items on the menus had to change, because that's what the design called for. It might have been possible to make them stick to preferred directions, but I couldn't think of any obvious design that would work for the wide, open-ended range of objects and actions they'd have to display, which wouldn't make it more difficult to create objects, and wouldn't require revisiting and fixing all the objects that were already produced.

The Sims pie menus were something I whipped up one night and just checked into the code base, and then gradually evolved over time. But since they weren't part of the primary game design, I couldn't make them do anything that would throw a monkey wrench into the object creation or programming process. They're implemented as a custom subclass of the Sims user interface framework widget, but the code reaches out and touches many different layers of the game (the simulator, the 3D character animation layer, the 2D user interface layer, the pixel based image processing layer). They're designed to automatically present dynamically generated pie menus, and they always have the same graphical appearance. So they don't support any editor control panels or customizability features. The way they handle overflow items is far from ideal.

I implemented the ActiveX pie menus in C++ prior to working on The Sims, and my approach to designing a reusable pie menu component was much different the approach I took to The Sims pie menus.

- http://www.piemenu.com/ActiveXPieMenus.html  
- http://www.piemenu.com/PieMenuDescription.html  

The ActiveX pie menus had many convenient and experimental features, and featured configuration control panels so user interface designers can easily customize them with tools like Visual Basic. They tried to be everything for all people, so the design was stretched in many different directions at once, instead of being focused on a single application. They're easy for designers to configure, but they don't give you much control over how they appear. The C++ code was getting complex and hard to maintain, because it had to do all the dynamic layout and rendering itself, without the help of a web browser. They suffered from html-envy, and I didn't feel like re-implementing Internet Explorer just so you could put animated gifs and blinking green text in your pie menus. So if you can't beat them, join them.

Much later, I implemented the JavaScript pie menus after working on The Sims, and my approach was focused on making an open xml-based interface that would be useful for web designers and online services, and leverage existing technology instead of trying to re-implement it. The xml menu specification is primary; the implementation that turns the xml into pie menus is secondary, and replaceable. The JavaScript pie menus are much simpler than the ActiveX pie menus, they let you totally control their appearance with dynamic html, and they leverage the web browser, JavaScript and XML, instead of trying to do everything themselves. They're lacking in the keyboard navigation department, and it would be nice to be able to pop them up in their own independent window, that could overlap frames and extend outside the browser window.

Even though they lack many of the features of the C++ ActiveX pie menus, I like the JavaScript pie menus best, because they're so simple and flexible. You can drop down to JavaScript and DHTML to make them do anything they don't already do. They're more like an extensible framework that you can populate with XML, JavaScript, HTML and other browser-based technologies (like VML, used to implement the graphics in Fasteroids), instead of being a monolithic component like the ActiveX control.

I've used the JavaScript pie menus in several different projects since I wrote them a few years ago. I've learned a lot more about JavaScript object oriented programmer since then, and they're long due for a rewrite. They need to be extended with some of the useful features of the ActiveX pie menus like paging, keyboard navigation, browsing, editor control panels, etc.

The code needs to be cleaned up so it works in any browser, and also other JavaScriptable graphical systems like SVG and Flash. I like IE's Dynamic HTML Behavior controls, but I think it would be best to write some clean JavaScript classes that worked in any browser, and then simply package them as a HTML Behavior Control for Internet Explorer, so you'd have one set of code that worked well in all browsers. I've ported the pie menu and fasteroids code to SVG (Scalable Vector Graphics, like PostScript for XML that you can animate like dynamic HTML with JavaScript, DOM and CSS).

Adobe's SVG viewer can do some beautiful amazing stuff, in real time! Now that JavaScript is the lingua franca of the web, it would be great to factor out all the graphics and input from the core pie menu class, so you could subclass the generic pie menus for Flash, SVG, Dynamic HTML, etc. They should be all based on the same core xml pie menu format, that enables you to include embedded visual representations like html, svg and flash.

Presently, the HTML-based JavaScript pie menus let you include an `<html>` tag in any `<piemenu>` or `<item>`, containing arbitrary xhtml that defines its appearance in the web browser, overriding the automatically generated label.

I propose to generalize that so you can also have other types of tags like `<svg>` and `<flash>` (given some way to represent flash in XML, or point to named objects in a separate flash file). It should also support a standard set of high level generic tags like `<image>` and `<text>`, that the implementations would translate into the native representation like `<img>` tags or Flash objects.

One of the great ideas behind xml is abstraction and reusability: to enable you the author to write what you MEAN at a high level, instead of the low level details about how to do it, so many different implementations can translate your high level intentions into their own internal low level implementation details. That's why it's so great for describing user interfaces like pie menus.

I've also developed a Palm application with pie menus for the touch screen: ConnectedTV turns your Palm into a universal IR remote control integrated with a personalized TV guide. It's designed so you can use it with one hand, without a stylus. You can stroke the buttons with your finger, to invoke different commands in different directions. For example: stroke left and right to page to the previous and next program; stroke up to change the channel to the current program; stroke down to read more about the current program; stroke the ratings button up to add a program to your favorites list; stroke it down to add it to your bad programs filter.

- http://www.Connected.TV/

I haven't seen Sacrifice, but thanks for pointing it out to me -- I'll look it up and check it out.

---

## Source

- Blog permalink: `http://www.donhopkins.com/categories/gameDesign/2004/02/05.html#a69`  
- Wayback category page: https://web.archive.org/web/20040317155006/http://www.donhopkins.com/blog/categories/gameDesign/

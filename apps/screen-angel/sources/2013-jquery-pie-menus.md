# jQuery Pie Menus

*Design and documentation for the jQuery pie menu implementation, written alongside the aQuery
proposal and linked from it. Recovered from the Wayback Machine capture of
`donhopkins.com/mediawiki/index.php/JQuery_Pie_Menus` dated 2018-06-18. Verbatim; only the
MediaWiki table of contents was removed. Source: github.com/SimHacker/jquery-pie*

*Why it's here: the pie menus were the thing Don actually built on top of the transparent
overlay in 2013. aQuery was the layer that would have let them read their contents out of live
applications. See [`../AQUERY.yml`](../AQUERY.yml) and [`2013-email-thread.md`](2013-email-thread.md).*

---

I have developed a new implementation of pie menus for jQuery, which you can [play with here](http://www.DonHopkins.com/home/CAM6/jquery-pie/html/jquery-pie-demo.html).

You can get the source from GitHub at: https://github.com/SimHacker/jquery-pie and clone it with:

   git clone --recursive https://github.com/SimHacker/jquery-pie.git

One change is that I'm de-emphasizing the idea of "menus", and just calling them "pies", because I believe that framing pies as menus has too much historical baggage, does not emphasize their gestural, direct manipulative qualities, and precludes thinking of them more like a directed graph or geographical map, instead of a hierarchical tree.

Another change is that I have refactored them to use a slightly different model than previous implementation of pie menus I've developed.

## Models

### Target

The target is the DOM object that the jQuery pie component is attached to.

It contains a set of named pies, defined either by the ID of a DOM element, or some JavaScript data.

When you click on it, it activates one of the pies, either the default, or one dynamically selected by a JavaScript handler that decides the current pie.

Targets that select between multiple pies are useful for switching between different context sensitive pies, and for navigating submenus trees (parent/child menus in a [hierarchy](https://en.wikipedia.org/wiki/Hierarchy_(mathematics))), or interlinked "sibmenus" maps (sibling menus in an [undirected graph](https://en.wikipedia.org/wiki/Undirected_graph#Undirected_graph), connected back and forth in opposite directions).

### Pie

A "pie" contains a list of slices, each of which has a particular direction. (TODO: example)

Pies contain slices, and they have a background and an overlay, which may contain arbitrary HTML content.

The design of pies containing slices and slices containing items makes it easier to support slices with zero or multiple items, and that makes it easier to edit pies, because adding and removing items does not rearrange the slice directions of the other items, so they are more stable and easier to visualize and edit.

Previous implementations of pie menus have had the pies contain items directly, plus an automatic layout algorithm that could place a limited number of items evenly spaced around the pie, and then place overflow items below the bottom item like a traditional linear menu, or above the top item, or outside an any direction. But that made it hard for designers to create and edit menus easily, because it did not give them enough control, adding or removing one item would change the directions of all the other items, and it was hard to visualize which items would go where, by the order of a list.

By adding an extra layer to represent slices directly, that separates the layout of the directions from the layout of the items, and makes it easier to design a stable "direct manipulation" interface for editing menus, and control the number of directions without constraining the number of items.

It's desirable for pie menus to limit the number of slices to eight or twelve, and to have an even number of items. So instead of inserting inactive "dummy" items to bring the number of items up to 4, 8 or 12, you just configure the pie to have the number of slices you want, and then add as many items to each slice as you want, or none at all.

This also enables the automatic layout algorithm to operate at both the slice and the item layer, and lets you configure each slice with its own layout policy, as desired. Different layout policies are appropriate for different directions, and for different kinds of items. So a pie menu can mix as many layout and interaction strategies in each slice as necessary

### Slice

Each slice is defined by a direction, and slices can be in any direction (as long as all directions are unique), and they don't have to be evenly spaced.

Slices contain items, and they have a background and an overlay, which may contain arbitrary HTML content.

Mathematically, it simply uses the [dot product](https://en.wikipedia.org/wiki/Dot_product) of the direction of the cursor and the direction of the slice to determine which slice is selected. (That means it picks the slice whose direction is closest to the cursor direction.) (TODO: illustration)

Instead of explicitly defining the subtend (angular width) of each slice, the direction of each slice is explicitly define, and the edges between adjacent slices are implicitly derived, as the direction half way between the directions of adjacent slices. So no matter how many slices there are (of course there must be at least one), and what their directions are (of course they must all be different), every direction corresponds to exactly one of the slices, with no overlaps or gaps.

So, for example, a slice could be wider to one side of its direction, than to the other side, because the adjacent slices are at different angles. (TODO: illustration and example)

Slices are selected purely by the direction of the cursor from the center of the pie. The distance can be used as a parameter, either as a continuous number, or to select between different items.

Each slice contains an ordered list of items, which may be empty, or contain any number of items.

There are many ways to manipulate and present a linear distance parameter, or to layout and select between a set of discrete items. So pie slices support different item layout an selection policies, as well as background and overlay layers for presentation, and notification callbacks for dynamic feedback.

You can configure slices to emulate and encompass the roles of traditional widgets, like linear sliders (as "slideouts"), pulldown menus (as "pullout menus"), and dropdown boxes (as "dropout boxes").

### Item

A "slice" contains a list of items, which are positioned and selected according to the slice's layout and selection policy.

An item contains an optional label, and has a background and an overlay that may contain arbitrary HTML content.

#### Equidistant

One policy that works well for small icons is centering them along the slice's directional vector at even distances, and selecting the one whose center is nearest the cursor. (TODO: illustration and example)

The pie brings the currently selected slice to the top, and the slice brings the currently selected item to the top, so big items can overlap (like baseball cards), and  the user can select between them by distance.

#### Justified

Another policy that works well for text labels is justifying them against each other so they touch but don't overlap, and selecting them by the one that contains the cursor, or possibly the one closest to the cursor, if none of them contain the cursor. (TODO: illustration and example)

A pie menu with a single south slice, whose items are justified against each other and of the same width, is just like a traditional linear menu.

#### Pull Out

Another approach that works more like a "slider" or "pull out menu" is to only show the currently selected item centered at a fixed distance along the slice's directional vector, and switch between the items by the cursor's distance from the menu center. (TODO: illustration and example)

## Defining and Editing

There are several different approaches to defining and editing pies, that are appropriate for different situations and designers.

### API

One approach is to define them programmatically in code through an API. The audience for that approach is client and server programmers, and it's useful for dynamically generated menus from data.

Pie menus defined by JavaScript data can also have embedded JavaScript "onshow" handler functions that dynamically create or modify the pie, slices and items, depending on run-time data.

There will be a library of utility functions and temples for defining pies, slices and items of various styles and for various tasks.

### JSON

Another approach is to define them with JSON data structures, which can be dynamically generated on the server or client, or written by hand. The audience for that approach is client and server programmers, and designers who are comfortable editing JSON data. It's useful for dynamically generated menus from data, and also static menus designed by hand.

### HTML

Another approach is to define them with the HTML DOM, by creating nested elements that define the pie, slices and items, as well as backgrounds, overlays, labels, icons, graphics and other visual elements. That can dynamically generated on the server or client, or written by hand. The audience for that approach is web designers who are more comfortable with HTML than JSON, or who want to design menus that use a lot of custom HTML in their presentation. It's useful mainly for static menus designed by hand, but also for dynamically generated menus from data.

### Tools

Another approach is to define them with a user interface design tool, either with lists and buttons and property sheets, or by direct manipulation, dragging and dropping, etc. The audience for such tools could be either user interface designers, or (if it's easy enough to use and well integrated the application) end users themselves. It's useful for application specific menus created by designers who would rather not use HTML or JSON directly, and for task specific menus created by users who need to use a small set of specific commands for a particular unique task, out of a large set of available commands.

As an example of user created pie menus, your World of Warcraft character has a unique set of abilities, weapons, magic items, food, buffs and spells, so you want to be able to create efficient sets of pie menus with just the items you need for each different task and mode of gameplay.

## Notification and Tracking

An important issue is how pie menus are integrated with the application. There must be a way for pie menus to notify the application which item was selected. There should also be a way to provide rich feedback during tracking, to preview the effect of the selection, give the user useful feedback and documentation, emphasize and reveal selected options, and minimize the clutter of irrelevant and unselected options.

Pies support three different ways of attaching notifiers for tracking, and they support [event bubbling and capturing](http://stackoverflow.com/questions/4616694/what-is-event-bubbling-and-capturing), so you can attach special purpose handlers to items, or more general ones to slices, pies, or the target itself.

### HTML Attributes

HTML element are traditionally marked up with attributes containing JavaScript code, like:

   <element onclick="javaScriptFunction(event)"/>

### jQuery Handlers

jQuery supports programatically attaching JavaScript handlers to elements like:

   $('#elementIdentifier').on('eventName', function(event) { handle(event); });

### JavaScript Data

JavaScript data structures used to configure the jQuery component or define the pie menus themselves may contain handlers as JavaScript functions. That is not strictly permitted by JSON, which is just JavaScript data not including functions, but JSON can include the names of JavaScript functions defined elsewhere, or the names or messages to send to other objects, instead of actual JavaScript functions.

   var pieDefinition = {
       slices: [ ... ],
       onpieitemselect: function(event, pie, slice, item) {
           ...
       }
   };

## Customization

There are many different ways to customize pie menus, including their structural layout, visual presentation, interactive feedback, and application integration.

### CSS Classes and Styles

Pies, slices and items can be configured with custom CSS classes and style definitions, both statically and dynamically during tracking.

### HTML Content

Pies, slices and layers all have their own backgrounds and overlays, which may be empty and invisible, or contain arbitrary HTML and CSS, including HTML content, jQuery components, SVG, Canvas, WebGL, video, 3D CSS transforms and visual filters, or anything else the web browser supports.

### Dynamic Feedback

Pies provide a full set of notification callbacks, coupled with flexible presentation layers, that enable rich real time previewing and feedback, and self revealing incremental help and documentation.

### Rich Application Integration

The application or game itself, and the objects in its domain, can provide direct real-time previews of the pie's potential effect during tracking. This enables a more immersive, [direct manipulation](https://en.wikipedia.org/wiki/Direct_manipulation_interface) style of interface.

Real time in-world feedback is important, because pie slice selection is based purely of the direction of cursor motion. Once you've learned the slice directions through [muscle memory](https://en.wikipedia.org/wiki/Muscle_memory), you can "mouse ahead" without looking at them, or taking your attention away from whatever else you were looking at. So instead looking at the menu itself, your visual attention can stay focused on the object you're interacting with, which is even easier and more direct and immersive with real time in-world feedback.

# Documentation

## Creating and Configuring a Pie Target

This jQuery pie plug-in lets you attach a pie target widget to a DOM
element, pass in an options dictionary to configure it and define the
pies, and attach event handlers to it.

   var gTarget = $('#target').pie({
       // Configuration options go here.
   });

## Options Dictionary

The options dictionary contains keys to configure the
target and define the pies. It can also contain event
handler functions. Additionally, you can define jQuery
even handler functions by calling .on('eventName', ...)
on the target.

The pies, slices and items may inherit properties and event handlers
from each other and the options dictionary through delegation and
event bubbling.

There are two main forms of pie definitions: dictionaries, or DOM
elements. And there are several ways of referring to those pie
definitions.

The most direct way to is to define a single pie dictionary in
options.defaultPie, which will be popped up when you click on the
target.

Less directly, you can also define one or more pie dictionaries in
options.pies, and refer to the one you want to pop up with a pieRef
string in options.defaultPie. When you click on the target, it looks
up the options.defaultPie string in the options.pies dictionary, and
pops that one up.

Another more dynamic way is to define an optional options.findPie
function that dynamically resolves, references or creates the pie to
pop up when you click.

Also, options.defaultPie, options.findPie and options.pies may use
jQuery selector strings to refer to DOM elements that define the pie.

### DOM Pie Definitions

You can optionally define pies with DOM elements, and refer to them
with jQuery selectors, either defined in options.defaultPie, or
returned by optoins.findPie, or defined in options.pies. The DOM
elements can define properties as data-<scope>-property="<value>"
attributes (supporting inheritence) and event handlers as
on<event>="<javascript>" attributes (supporting even bubbling).

Not that jQuery event handlers only work on the target element, but
events are not sent directly to the DOM elements used to define pies,
slices and items, so use on<event> attributes instead, use shared
handlers attached to the target, or define pies with dictionaries
(which themselves may contain handler functions) instead.

### Pie Dictionary

Pies can be defined by JavaScript dictionaries. They may contain
various keys to configure their appearance and behavior, and also
event handler functions.

A pie dictionary usually contains a key called "slices", which is an
array of pie slice definitions. But they can also contain an onshowpie
event handler function that dynamically creates or modifies the pie
slices and/or items before the pie is shown. You can even have a pie
without any slices, if you want a pie that just tracks the continuous
cursor direction and distance. The options dictionary can contain an
"onshowpie" event handler that is shared by all pies, via event
bubbling.

### Slice Dictionary

Slices can be defined by JavaScript dictionaries, too. They may also
contain various keys to configure their appearance and behavior, and
event handler functions.

A slice dictionary usually contains a key called "items", which is an
array of slice item definitions. But they can also contain an
onshowslice event handler function that dynamically creates or
modifies the slice items and before the pie is shown. You can even
have a pie slice without any items, if you want a slice that just
tracks the continuous cursor distance. The pie or options dictionaries
can contain an "onshowslice" event handler that is shared by all pies or
slices, via event bubbling.

### Item Dictionary

Items can be defined by JavaScript dictionaries, as well. And of
course they also may contain various keys to configure their
appearance and behavior, and event handler functions.

A slice dictionary usually contains a key called "label', which is
shown to the user. And it can of course contain an onshowitem event
handler function that dynamically creates or modifies the label or
other item properties before the pie is shown. You can even have a pie
slice without a label, if you want to be mysterious and confuse the
user, or use icons or html instead of text, by inserting content into
the item background or overlay.

## Deciding which Pie to Pop Up

Here is the exact algorithm used to define which pie to pop up when
you click on a pie target.

### options.defaultPie

When the user clicks on the target, it calls the method
findDefaultPie(event), which uses the parameter options.defaultPie to
decide which pie to pop up.  That may contain either a pie dictionary,
or a pieRef string, or null. If it's null, then no pie is popped up.

### pieRef string

A pieRef is a string that refers to a pie definition somehow.  It can
be key into the options.pies dictionary, or a jQuery selector, or some
kind of identifier understood by the options.findPie function.

### options.findPie function

To resolve the pieRef, it is first passed along with the event to an
optional function defined in options.findPie = function(event,
pieRef).

The options.findPie function can use the event to implement context sensitive
pies by picking a pie based on the location of the click event, and it
can also use the pieRef to implement a level of indirection for naming
pies, or a state machine for implementing submenus and other forms of
menu navigation (like sibmenus).

If options.findPie returns null, then no pie is popped up. If it
return a dictionary pie definition, then that pie is popped up. If it
returns a string, then it may be the same or a different pieRef, which
is further resolved. If options.findPie is not defined, then it just
goes on to the next step.

### options.pies dictionary

The next step in resolving a pieRef, if there is no findPie function,
or if findPie returned a string, is to look the pieRef up in the
options.pies dictionary.

If the pieRef is defined in options.pies, then it may contain either a
pie dictionary, or a jQuery selector string referring to exactly one
DOM element.

### jQuery selector

If a pie dictionary was not returned by findPie or found in
options.pies, then it is assumed to be a jQuery selector identifying
exactly one DOM element. So makePieFromDOM is called on that selector,
and it tries to create a pie menu dictionary from the DOM elements. If
that fails, then it returns null and no pie is popped up. If it
succeeds, then the resulting pie dictionary is cached in options.pies,
and that pie is popped up.

# Automating The Sims Character Animation Pipeline with MaxScript

*Thursday, February 19, 2004*

Original link (John’s MaxScript resources): https://web.archive.org/web/20040317155006/http://www.lyric.com/maxscript101/index.htm  

---

> From: johnw@lyric.com (John Wainwright)  
> Sent: Tuesday, May 05, 1998 1:31 PM  
> To: dhopkins@maxis.com (Don Hopkins)  
> Subject: CGDC talk
>
> Hi, Don.
>
> Kinetix has roped me into giving a talk about MAXScript at the Game Developer's Conference in Long Beach on Friday. I wanted to see if its OK to mention your use of MAXScript at Maxis and if so, maybe you could give a few bullet points on what it's OK for me to mention. Of course, I remember the note track key stuff and the Access database interface, but I'm not sure if there were other things and how all that wound up coming together.
>
> Thanks,  
> John.

Certainly! Here is a description of how I'm using MaxScript to implement The Sims character animation pipeline:

The Sims character animation system is fed by a complex content pipeline, which integrates disparate tools including: SourceSafe, Access, 3D Studio Max, Character Studio, Biped, Physique, MaxScript, and a custom C++ plug-in that incorporates The Sims character animation engine, the same code which runs in the game.

The goal was to automatically drive the exporter from the database, to minimise the effect of human error, and to support automatic batch exporting of many files sequentially.

At first, I implemented the initial version of the character animation exporter in C++, as an ordinary 3D Studio Max exporter plug-in. But that was inflexible and couldn't be easily extended or automated.

So I recast the animation exporter as a MaxScript primitive, so I could call it under MaxScript program control, through MaxScript's extension plug-in interface.

The new character animation exporter is implemented in 3D Studio Max with MaxScript and a C++ plug-in. It has a utility interface panel for automating content creation tasks like database queries, content validation and batch exporting.

The MaxScript extension plug-in interface allows developers to add new primitives to the MaxScript language in 3D Studio Max, call any C++ code or libraries from MaxScript, pass parameters back and forth, and fully access the underlying Max plug-in interfaces. So it was desirable to implement the exporter in MaxScript, instead of resorting to using the standard exporter interface with only C++.

The standard 3D Studio Max exporter plug-in interface is inflexible, and requires you to implement a bizarre node enumeration callback interface; but the MaxScript extension interface is completely general purpose and easily extensible. It allows you to do most of the programming in MaxScript instead of C++, which is much more fun and concise.

By using MaxScript, I was also able to integrate the exporter with other tools in various ways: I used OLE automation to read an Access database table describing all the animations, the DOSCommand primitive to invoke SourceSafe to check the files in and out of the source control system, and the file system access primitives to read and write text files.

Implementing The Sims character animation exporter as a MaxScript primitive, instead of as a normal exporter plug-in, had many advantages: MaxScript makes it easy to write user interface dialogs integrated with 3D Studio Max's interface. You can pass complex parameters to plug-in MaxScript primitives, and they can return error messages and rich data structures describing the results of exporting. MaxScript can read the parameters from a database, automatically call the exporter without any human intervention, validate the results against the database, and report meaningful error messages and statistical measurements.

I used MaxScript to make a utility control panel, which allows artists to browse all the animations in the database, load the corresponding Max files, check the content in and out of SourceSafe source code control, configure the export directory, automatically export any animation, and batch export the whole database or subsets of it.

We're using note tracks to mark up the animations in time, and to insert events into the animation. Think of note tracks as XML in 3D+Time. A note track can be associated with any node in the 3D hierarchy, and contains keys in time, with any text property values. The text is formatted as a property list of "name=value" associations. The exporter looks for these notes to figure out what to do.

I added some note track access primitives, so MaxScript could automatically insert appropriate note tracks and properties as specified in the database, and validate that the required notes are present in the file. The arist can then adjust the position of the notes in time (moving footstep events so they correspond to the time when the foot hits, for example), edit their text "name=value" properties (to control the exporter behavior and pass it parameters, as well as sending events to the animation playback engine at run-time).

If you would like to show an interesting MaxScript programming example, there's a neat function called "defRecordStruct" in the code I posted to the Kinetics MaxScript bboard, that takes an Access RecordSet OLE object, and defines a MaxScript record that corresponds to it, and a MaxScript function that reads it into a record. An interesting exercise would be to extend it to define a MaxScript function that writes the record back into the OLE RecordSet.

One reason I like MaxScript so much, is that it's extremely similar to [ScriptX](https://web.archive.org/web/20040317155006/http://catalog.com/hopkins/lang/scriptx/scriptx.html). But it has many extensions to support 3D animation, and an excellent native code plug-in interface, which ScriptX lacked. I like ScriptX because I had fun working with it for two years at Kaleida Labs. It's no coincidence that ScriptX and MaxScript are similar, because both languages were designed by the same person, John Wainwright, whose language design sense is elegant and practical.

---

## Source

- Blog permalink: `http://www.donhopkins.com/categories/gameDesign/2004/02/19.html#a84`  
- Wayback category page: https://web.archive.org/web/20040317155006/http://www.donhopkins.com/blog/categories/gameDesign/

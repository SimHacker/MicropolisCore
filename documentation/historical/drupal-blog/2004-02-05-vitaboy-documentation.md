# VitaBoy Documentation

*Thursday, February 5, 2004*

**By Don Hopkins, Maxis.**

This document describes VitaBoy, the skeletal character animation system in *The Sims*, written by Don Hopkins at Maxis.

VitaBoy combines several different types of data together to render the animated characters in the game, including skeletons, skills, suits and texture maps.

Artists create the skeletons, skills and suits in 3D Studio Max, and the texture maps in Photoshop.

The CMX Exporter is a 3D Studio Max plug-in and MaxScript user interface, which allows artists to export skeletons, skills and suits from Max files into CMX files that the game can read.

Character Studio is another 3D Studio Max plug-in, that allows artists to animated a Biped skeleton, and to attach deformable mesh suits to it with Physique. The CMX Exporter knows how to support Character Studio Biped and Physique, but it can be used with other kinds of skeletons and suits as well.

The way the CMX Exporter knows what to export from a Max file, is by looking for note tracks on the bones, for keys containing tags that control the exporter. The artist inserts note track keys into the Max file, to mark up the skeletons, suits, skills and events. The tags in the note track keys tell the exporter what to export from the Max file.

The Access database tells the exporter which skeletons, skills and suits are defined, which Max files contain them, and where to export them. The artist can select the name of a skeleton, skill or suit from a scrolling list, and automatically load, validate and export the correct Max file to the correct destination. The exporter can also check the exported files out from and into SourceSafe. The artist can use the exporter manually without the database, but the database is extremely useful for avoiding accidents when there is a lot of content to manage.

### What followed in the original post

The Drupal entry embedded a **very long** Word-exported manual: step-by-step installation of the CMX exporter (`maxiscrp.dlx`, `maxis-maxscript.ms`), database cache workflows, exhaustive note-track tag vocabulary for skeletons/suits/skills, mesh export rules, internal file formats (CMX/BCF/SKN/BMF/BIN/CFP/NDX/FAR), and extensive C++ class descriptions (`Skeleton.cpp`, `VitaBoy.cpp`, `SAnimator.cpp`, `CMXExporter.cpp`, etc.).

That full text is preserved on the Internet Archive capture of the daily page (same anchor under **Pie Menus** or **Game Design**):

- **Full VitaBoy / exporter documentation (Wayback, Pie Menus daily page):**  
  https://web.archive.org/web/20040423032002/http://www.donhopkins.com/categories/pieMenus/2004/02/05.html#a73  
- **Alternate capture (Game Design daily page):**  
  https://web.archive.org/web/20040317155006/http://www.donhopkins.com/categories/gameDesign/2004/02/05.html#a73  

For related extracts already split out in this folder, see:

- [2004-02-05-sims-animation-file-format-cmx.md](2004-02-05-sims-animation-file-format-cmx.md) — layout sketch  
- [2004-02-19-maxscript-sims-animation-pipeline.md](2004-02-19-maxscript-sims-animation-pipeline.md) — pipeline narrative (reply to John Wainwright)  
- [2004-02-05-skn-format-email-bil-simser.md](2004-02-05-skn-format-email-bil-simser.md) — SKN blending explanation  

---

## Source

- Blog permalink (also filed under **Pie Menus**): `http://www.donhopkins.com/categories/pieMenus/2004/02/05.html#a73`  
- Same post under Game Design: `http://www.donhopkins.com/categories/gameDesign/2004/02/05.html#a73`  
- Wayback — Pie Menus category: https://web.archive.org/web/20040423032002/http://www.donhopkins.com/blog/categories/pieMenus/  
- Wayback — Game Design category: https://web.archive.org/web/20040317155006/http://www.donhopkins.com/blog/categories/gameDesign/

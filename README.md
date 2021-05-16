# Whitmir.io

Whitmir is an online tool for writing books (and blogs), and is intended to be as 
simple as possible. The project is a small-scale tool that I'm writing in my free
time. And the design has been implemented to be as simple as possible to try and
increase the chances of being able to finish it with the small amount of freetime
that I have to code in a given day. 

Right now I have the basic functionality implemented. Meaning that I have the
general layout, connection to Google Drive, books, chapters and a basic
editor working, so the next step will be to focus on the rest of the functionality,
before coming back to work on the editor toolbar for the final completion. To 
keep myself focused, the remaining tasks to be implemented are listed below.

## Development Checklist

1. [ ] Options for Book
2. [ ] Export as ePub
3. [ ] Settings
4. [ ] Manual
5. [ ] About
6. [ ] Support
7. [ ] Implement Toolbar
8. [ ] Re-Order Chapters

### 1. Options for Book

With the options for the book, the main functionality here is the category. When
we click on the toggle, we want to populate the select dropdown with the existing
categories. The other two options that I want to include at the moment are
cover (yes or no) and whether to include a table of contents or not. 

### 2. Export as ePub

This is part of the core functionality and I should probably jump ahead and implement
this as far as proof of concept goes. Basically each book is a folder with a list
of html files acting as each chapter. Exporting the ePub book will create the xml file
needed to index all of the html chapters and save it inside the folder. We will then
loop through all of the files in the folder, and add them to a zip file. And we
will finally download the zip as a file with a .epub extension.

### 3. Settings

Not sure what I'll put here yet. Maybe things like theme, about the author, font
size. For now I can make a placeholder page that gets displayed when the option is 
clicked.

### 4. Manual 

At this point, somewhat similar to settings as I should make a placeholder first.
But in this case I should probably make videos to describe specifically what the
tool is for, who it is intended for, and how to use it. 

### 5. About

Right now this option opens this Github page, which is pretty user unfriendly. 
In this case too, I should probably add a page that descibes whitmir as an 
open-source tool, where you are in control of your own data. Give the link
for the Github page. And provide the text for the terms of service and the
privacy policy. 

### 6. Support

Right now this options opens the Ko-fi page. It would probably be a good idea
to use the Ko-fi widget to give small note. (I'm broke af, a few dollars helps
a lot), and maybe provide some QR codes for BAT or DOGE coin donations. Suggesting
people use brave would also probably be a good idea, as that would let people
support for free. 

### 7. Implement toolbar

This is probably going to be the most annoying to implement. I tried Quilljs,
which was nice because it ended up being really easy to implement the toolbar.
But otherwise wasn't what I wanted with respect to how they handle the data with
the Delta format (i was hoping for something more direct HTML). Right now I've
switched to TinyMCE, which is good for HTML editing, but so far I haven't seen anything
that allows for a custom toolbar to be implemented similar to Quilljs. I might
try other editors, or I can try and write a toolbar for TinyMCE (hopefully not).
But we can leave this until later as the other functionality isn't dependent on this.

### 8. Re-Order Chapters

For chapters there are a few nice-to-have features that I want to implement. Being able
to drag to re-arrange chapters would be a nice to have feature. Adding sub-headers
into the chapter list would be _really_ nice to have. Being able to view chapter
revisions would be a _really really_ nice feature to have. And I haven't thought too
much about how I want to implement deleting chapters as far as moving them into the
trash. 

Whiskers.js
===========

About
-----

Whiskers is a templating system focused on template readability.  By limiting
template logic, the processing and formatting of data is kept separate from the
design of its display.

At around 100 lines of code, Whiskers.js may be the smallest mustachioed
templating system, compiling templates to pure, incorruptible JavaScript for
quick execution.  Take a look at the [code][]!  It's straightforward and 
documented.

[code]: https://github.com/gsf/whiskers.js/blob/master/lib/whiskers.js


Installation
------------

For the browser, simply source the file at `lib/whiskers.js`.

For node, `npm install whiskers`.


Example
-------

Templates are rendered as follows, where "template" is a string and "context"
and "partials" are objects:

    var rendered = whiskers.render(template, context, partials);

A template might look something like this:

    <article>
      <header>
        {>header}
      </header>
      {if tags}
      <ul id="tags">
        {for tag in tags}
        <li>{tag}</li>
        {/for}
      </ul>
      {\if}
      <div>{content}</div>
    </article>

With the following context:

    {
      title: 'My life',
      author: 'Bars Thorman',
      tags: [
        'real',
        'vivid'
      ],
      content: 'I grew up into a fine willow.'
    }

And the following partials:

    {
      header: '<h1>{title}</h1>\n<p id="by">{author}</p>'
    }

It would be rendered as this:

    <article>
      <header>
        <h1>My life</h1>
        <p id="by">Bars Thorman</p>
      </header>
      <ul id="tags">
        <li>real</li>
        <li>vivid</li>
      </ul>
      <div>I grew up into a fine willow.</div>
    </article>


Usage
-----

Whiskers keeps templates readable by limiting tags to variables, statements 
("for" and "if"), and partials.

Variable tags retrieve data from the context.  They may use dot notation:

    {object.variable}

A "for" tag loops over variables in an array:

    {for variable in array}
      <p>{variable}</p>
    {/for}

An "if" tag only displays a section of the template for a truthy variable, or
the inverse:

    {if variable}
      <p>{variable}</p>
    {/if}
    {if not variable}
      <p>No variable!</p>
    {/if}

As you can see, "for" and "if" sections are closed by a corresponding tag with
a leading slash. 

A partial tag begins with a greater-than sign.  It is replaced by a
sub-template at that spot in the template:

    <div>{>partial}</div>

Any tag is escaped from rendering by prepending a backslash:

    \{variable}

See the test directory for many usage examples.


Forebears
---------

Whiskers is influenced by these fine projects:

* <http://github.com/janl/mustache.js>
* <http://github.com/akdubya/dustjs>
* <http://github.com/andychu/json-template>
* <http://docs.djangoproject.com/en/dev/ref/templates/>

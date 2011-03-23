Whiskers is yet another mustachioed templating system.  This (whiskers.js) is
the JavaScript library.

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
      <p id="tags">{for tag in tags}{tag} {/for}</p>
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
      content: 'I grew up into a willow.'
    }

And the following partials:

    {
      header: '<h1>{title}</h1>\n<p id="by">{author}</p>'
    }

Rendering as:

    <article>
      <header>
        <h1>My life</h1>
        <p id="by">Bars Thorman</p>'
      </header>
      <p id="tags">real vivid </p>
      <div>I grew up into a willow.</div>
    </article>


Usage
-----

Whiskers keeps templates readable by limiting tags to statements ("for" and
"if"), variables, and partials.  A "for" tag loops over variables in an array:

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

Variable tags may use dot notation.  If the variable is a function, its return
value will be used:

    {object.variable}

A partial tag begins with a greater-than sign.  It is replaced by a
sub-template at that spot in the template:

    <div>{>partial}</div>

Any tag is escaped from rendering by prepending a backslash:

    \{variable}

See the test directory for full usage examples.


Philosophy
----------

The limits of Whiskers templates (no filters or complex tags) encourage a
careful and thorough preparation of the context.  The retrieval and formatting
of data for display is therefore kept separate from the presentation.

Whiskers is influenced by these fine projects:

* <http://github.com/janl/mustache.js>
* <http://github.com/akdubya/dustjs>
* <http://github.com/andychu/json-template>
* <http://docs.djangoproject.com/en/dev/ref/templates/>

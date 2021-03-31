Whiskers.js
===========

**Note** The library is not supported for long time. It's usage is not recommended in any publicly available application due to potential security issues.

About
-----

Whiskers is focused on template readability. By limiting template logic, 
careful preparation of the context is encouraged, and the processing and 
formatting of data is kept separate from the design of the display.

At around 100 lines, Whiskers.js may be the smallest mustachioed templating 
system. It also compiles and caches for quick execution. Take a look at the 
well-documented [code][]!

[code]: https://github.com/gsf/whiskers.js/blob/master/lib/whiskers.js


Installation
------------

For the browser, drop the minified version at `dist/whiskers.min.js` in your
scripts directory (or source it directly from GitHub at 
<http://gsf.github.io/whiskers.js/whiskers.min.js>).

For node, `npm install whiskers`.

For use in [Express][], see [examples/express][exex].

[express]: http://expressjs.com/
[exex]: https://github.com/gsf/whiskers.js/tree/master/examples/express


Tests and Dist
---------------

For the browser, visit `test/browser/index.html`.

For node, `npm test`. It produces minified copy of library to dist folder


Example
-------

Templates are rendered as follows, where "template" is a string and "context"
is an object:

    var rendered = whiskers.render(template, context);

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
      {else}
        <p>No tags!</p>
      {/if}
      <div>{content}</div>
      {!<p>this paragraph is 
        commented out</p>!}
    </article>

With the following context:

    {
      header: '<h1>{title}</h1>\n<p id="by">{author}</p>',
      title: 'My life',
      author: 'Bars Thorman',
      tags: [
        'real',
        'vivid'
      ],
      content: 'I grew up into a fine willow.'
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
("for", "if", and "else"), partials, and comments.

Variable tags retrieve data from the context.  They may use dot notation, and 
hyphens are allowed:

    {object.a-variable}

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
a leading slash. The previous example could also be shortened:

    {if variable}
      <p>{variable}</p>
    {else}
      <p>No variable!</p>
    {/if}

The "else" tag can also be used with "for" to display something when the array
is empty:

    {for variable in array}
      <p>{variable}</p>
    {else}
      <p>Nothing in the array!</p>
    {/for}

A partial tag begins with a greater-than sign.  It renders any template
assigned to that variable with the current context:

    <div>{>partial}</div>

Comment tags comment out part of the template.  They begin and end with 
exclamation points. They can include newlines, spaces, and other tags.

    <p>{!these words and this {tag} 
      will not be rendered!}</p>

Any tag is escaped from rendering by prepending a backslash:

    \{variable}

See the test directory for server and browser usage examples.


Forebears
---------

Whiskers was influenced by these fine projects:

* <http://github.com/janl/mustache.js>
* <http://github.com/akdubya/dustjs>
* <http://code.google.com/p/json-template/>
* <http://docs.djangoproject.com/en/dev/ref/templates/>

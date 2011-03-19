Selleck is yet another mustachioed templating library.  This (selleck.js) 
is the JavaScript version.


Installation
------------

Coming soon.


Usage
-----

Selleck keeps templates readable by limiting tags to statements ("for" and
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

Templates are rendered as follows, where "template" is a string and "context"
and "partials" are objects:

    var rendered = selleck.render(template, context, partials);

Any tag is escaped from rendering by prepending a backslash:

    \{variable}

See the test directory for full usage examples.


Philosophy
----------

The limits of Selleck's templates (no filters or complex tags) encourage a
careful and thorough preparation of the context.  The retrieval, manipulation,
and conversion of data for display is therefore kept separate from the 
presentation.

Selleck is influenced by these fine projects:

* http://github.com/janl/mustache.js
* http://github.com/akdubya/dustjs
* http://github.com/andychu/json-template
* http://docs.djangoproject.com/en/dev/ref/templates/

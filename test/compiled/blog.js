(function() {
  return function(context) {
    var buffer = '';
    buffer += '<h1>'+getValue(context, 'blog.title')+'</h1>\n';
    if (getValue(context, 'posts')) {
      buffer += '<section id="posts">\n';
      var postA = getArray(context, 'posts');
      for (var postI = 0; postI < postA.length; postI++) {
        setValue(context, 'post', postA[postI]);
        buffer += ' <article>\n <header>\n <h1>'+getValue(context, 'post.title', 'safe')+'</h1>\n <p class="by">'+getValue(context, 'post.author')+'</p>\n </header>\n <div>'+getValue(context, 'post.content', 'markdown')+'</div>\n </article>\n';
        var commentA = getArray(context, 'post.comments');
        for (var commentI = 0; commentI < commentA.length; commentI++) {
          setValue(context, 'comment', commentA[commentI]);
          buffer += '<section class="comment">\n <header>\n <h1>A comment on '+getValue(context, 'post.title', 'safe')+', written by '+getValue(context, 'post.author')+'</h1>\n <p class="by">'+getValue(context, 'comment.author')+'</p>\n </header>\n <div>'+getValue(context, 'comment.content', 'markdown')+'</div>\n </section>\n';
        }
        if (!commentA) {
          buffer += '<p>No comments have yet been made.</p>';
        }
      }
      buffer += '</section>\n';
    } else {
      buffer += '<p>No posts!</p>\n';
    }
    return buffer;
  };
})()

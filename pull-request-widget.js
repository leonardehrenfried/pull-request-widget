(function(){
  var addPullRequest = function(event){
    console.log(event);
    var li = $("<li>");
    var a = $("<a>").attr("href", event.payload.pull_request.html_url);
    var text = "Pull request '" + event.payload.pull_request.title
               + "' opened on " + event.repo.name;
    a.text(text)
    li.append(a);
    getUl().append(li);
  },
  ul,
  getUl = function(){
    if(!ul){
      ul = $("<ul>").appendTo("#pull-requests");
    }
    return ul;
  };

  $("document").ready(function(){
    var user = "lenniboy"
    var url = "https://api.github.com/users/" + user + "/events?callback=?";

    $.getJSON(url, function(data) {
      var ul = $("<ul>");
      $.each(data.data, function(index, event) {
        if(event.type === "PullRequestEvent"){
          addPullRequest(event);
        }
      });

    });
  });
})();

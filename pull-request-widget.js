(function(){
  if (!console){
    console = {
      log : function(){}
    }
  }
  var addPullRequest = function(event){
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
  },
  page = 1,
  getPullRequests = function(url){
    console.log("fetching from "+url)
    $.getJSON(url, function(data) {
      console.log(data);
      if (data.data.length){
        $.each(data.data, function(index, event) {
          if(event.type === "PullRequestEvent"){
            addPullRequest(event);
          }
        });
        page++;
        var next = url.replace(/page=(\d+)/g, "page="+ page);
        console.log(next);
        getPullRequests(next)
      }
    });
  };

  $("document").ready(function(){
    var user = "lenniboy"
    var url = "https://api.github.com/users/" + user + "/events?callback=?&page=1";
    getPullRequests(url);
  });
})();

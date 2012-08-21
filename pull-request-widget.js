(function(){
  if (!console){
    console = {
      log : function(){}
    }
  }
  var
  pullRequests = [],
  addPullRequest = function(event){
    var li = $("<li>");
    $("<a>")
        .attr("href", event.payload.pull_request.html_url)
        .text("'" + event.payload.pull_request.title + "'")
        .appendTo(li);
    $("<span>").text(" opened on ").appendTo(li);
    $("<a>")
        .attr("href", "https://github.com/" + event.repo.name)
        .text(event.repo.name).appendTo(li);

    getUl().append(li);
    pullRequests.push(event);
  },
  ul,
  getUl = function(){
    if(!ul){
      ul = $("<ul>").addClass("pull-requests").appendTo("#pull-requests");
    }
    return ul;
  },
  page = 1,
  getPullRequests = function(url){
    console.log("fetching from "+url)
    $.getJSON(url, function(data) {
      data = data.data;
      if (data.length){
        $.each(data, function(index, event) {
          if(event.type === "PullRequestEvent" && event.payload.action === "opened"){
            addPullRequest(event);
          }
        });
        page++;
        var next = url.replace(/page=(\d+)/g, "page="+ page);
        getPullRequests(next)
      }
      else{
        cachePullRequests(pullRequests);
      }
    });
  },
  cacheKey = "pull-requests",
  cachePullRequests = function(events){
    if(localStorage){
      var in30Mins = Date.now() + 30 * 60 * 1000;
      console.log("Caching pull request. Expiry: " + new Date(in30Mins))
      localStorage.setItem(cacheKey, JSON.stringify({
        events: events,
        expiry: in30Mins
      }));
    }
  },
  getCache = function(){
    if(localStorage && localStorage.getItem(cacheKey)){
      var cache = JSON.parse(localStorage.getItem(cacheKey));
      if(cache.expiry > Date.now()){
        console.log("Fetching pull requests from cache. Expiry: " + new Date(cache.expiry));
        return cache.events;
      }
    }
  };

  $("document").ready(function(){
    var user = "lenniboy"
    var url = "https://api.github.com/users/" + user + "/events?callback=?&page=1";
    var cache = getCache();
    if(cache){
      $.each(cache, function(index, event){
        addPullRequest(event);
      })
    }
    else{
      getPullRequests(url);
    }
  });
})();

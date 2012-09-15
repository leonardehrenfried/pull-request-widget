/*
 * Github Pull Request Widget
 * by Leonard Ehrenfried <leonard.ehrenfried@gmail.com>
 * http://lenni.info/pull-request-widget/
 */

(function($){
  if (!console){
    console = {
      log : function(){}
    }
  }
  var
  pullRequests = [],
  addPullRequest = function(event){
    var li = $("<li>");
    $("<h4>").append(
      $("<a>")
        .attr("href", event.payload.pull_request.html_url)
        .text(event.payload.pull_request.title)
    ).appendTo(li);

    //body text
    var text = event.payload.pull_request.body, MAX = 40;
    $("<div>").addClass("body").text(text).appendTo(li);

    //meta information
    var meta = $("<div>").addClass("meta").appendTo(li),
    username = event.actor.login;
    $("<img>").attr("src", event.actor.avatar_url).appendTo(meta);
    $("<a>").text(username).attr("href", "https://github.com/" + username).appendTo(meta);
    $("<span>").text(" submitted to ").appendTo(meta);
    $("<a>")
        .attr("href", "https://github.com/" + event.repo.name)
        .text(event.repo.name).appendTo(meta);

    var  ul = getUl();
    ul.find("li.message").remove()
    ul.append(li);
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
  $.fn.pullRequests = function() {
    var user = this.data("github-user");
    if(!user){
      throw "Could not read Github username. Add the data-github-user attribute the element."
    }
    cacheKey += "-" + user;
    var url = "https://api.github.com/users/" + user + "/events?callback=?&page=1";
    var cache = getCache();
    var header = $("<div>").addClass("pull-requests-header");
    header.append($("<div>").addClass("tab").text(user + "'s pull requests"));
    this.append(header)
    if(cache){
      $.each(cache, function(index, event){
        addPullRequest(event);
      })
    }
    else{
      var ul = getUl();
      ul.append($("<li>").text("Fetching pull requests from the Github API...").addClass("message"));
      getPullRequests(url);
    }
  };
})(jQuery);


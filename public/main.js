$(function() {

  // $.ajax({
  //   url: "/api/topics",

  // })
  // .then(function(res) {
  //   console.log(res);
  // });
  
  // modify starts
  // alert("这是一个纯净版的轻性感页面。\n\n 只显示同感超过3的照片🤗")
  $.ajax({
      //url: "http://v2.same.com/channel/1033563/senses",
      // url: "data.json",
      url: "/api/topics",
      dataType: "json"
    })
    .then(function(res) {
      var result = [];
      for (var i = 0; i < res.length; i++) {
        var s_item = res[i];
        var item = {
          txt: s_item.s_txt,
          views: s_item.s_views,
          likes: s_item.s_likes,
          created_at: s_item.s_created_at,
          photo: s_item.s_photo,
          // photo: "http://s.same.com/image/e3fd8e29a57606ca0ed413118ebf21e5__c0_264_947_947__w947_h1704.jpg",
          channel: {
            name: "轻性感",
            icon: "http://s.same.com/icon/55acbfe5afe4d.png"
          },
          user: {
            username: s_item.s_user_username,
            avatar: s_item.s_user_avatar,
          }
        };
        result.push(item);
      }
      applyData(result);
    });


  $(".channel-info").on("click", function() {
    $("html, body").animate({
      scrollTop: $("html").offset().top
    })
  })
  // modify ends
  function applyData(data) {
    document.title = "【" + data[0].channel.name + "】";

    if (data[0].channel.icon === "") {
      $("#weixin-thumb img").attr("src", "../../src/images/website/favicon-192.png")
    } else {
      $("#weixin-thumb img").attr("src", data[0].channel.icon + "?imageView2/2/w/300/format/JPEG")
    }

    $(".channel-icon").css({
      "background-image": "url(" + data[0].channel.icon + "?imageView2/2/w/96)",
    })

    $(".channel-name").html(data[0].channel.name);
    goToChannel(data[0].channel.id);

    for (n in data) {
      applySenseTextPhoto(data[n]);
    }
  }
  function goToChannel(id){
        if (false){
        // if(WeixinApi.openInWeixin()){
          $(".channel-button").click(function(){
            var _blackout = new blackout({
              "click": true,
              "insertBefore": $(".get-out-of-weixin"),
            });
            $(".get-out-of-weixin").fadeIn();
            _blackout.addEventListener("clearStart", function(){
              $(".get-out-of-weixin").fadeOut();
            })
          })
        }else{
          var iOS = /(iPad|iPhone|iPod)/g.test( navigator.userAgent );
          if(iOS){
            $(".channel-button").click(function(){
              window.location = "same2.0://channel/" + id;
              setTimeout(function(){ 
                window.location = "http://share.ohsame.com/adto/qrcode?type=ios";
              }, 30);
            })
          }else{
            $(".channel-button").click(function(){
              window.location = "https://ohsame.com/channel/" + id + "/senses";
            })
          }
        }
      }
  function applySenseTextPhoto(data) {
    // console.log(data);
    var container = $("#sense-template .sense-wrapper.text-photo").clone();

    container.find(".user-avatar").css({
      "background-image": "url(" + data.user.avatar + "?imageView2/2/w/96)",
    })

    container.find(".user-name").html(data.user.username);

    var userDate = new Date(data.created_at * 1000);
    userDate = userDate.getFullYear() + "/" + (userDate.getMonth() + 1) + "/" + userDate.getDate()
    container.find(".user-date").html(userDate)

    if (data.photo) {
      var src = data.photo

      var parameter = src.match(/__c(([^_]+)_([^_]+)_([^_]+)_([^_]+))__w([\d]+)_h([\d]+)/)

      parameter.forEach(function(item, i) {
        parameter[i] = parseInt(item)
      })

      var x = parameter[2]
      var y = parameter[3]
      var w = parameter[4]
      var h = parameter[5]
      var W = parameter[6]
      var H = parameter[7]

      if (W < H) {
        var imagePosX = 0.5
      } else if (w === W) {
        var imagePosX = 0.5
      } else {
        var imagePosX = x / (W - w)
      }

      if (W > H) {
        var imagePosY = 0.5
      } else if (h === H) {
        var imagePosY = 0.5
      } else {
        var imagePosY = y / (H - h)
      }

      if (/imageMogr2\/auto-orient/.test(src)) {
        container.find(".sense-image").css({
          "background-image": "url(" + src + ")",
          "background-size": (W / w * 100) + "% auto",
          "background-position": (imagePosX * 100) + "% " + (imagePosY * 100) + "%"
        })
      } else {
        container.find(".sense-image").css({
          "background-image": "url(" + src + "?imageMogr2/auto-orient)",
          "background-size": (W / w * 100) + "% auto",
          "background-position": (imagePosX * 100) + "% " + (imagePosY * 100) + "%"
        })
      }

    } else {
      container.find(".sense-image").remove();
    }

    if (data.txt && data.txt !== "") {
      container.find(".sense-text").html(data.txt)
    } else {
      container.find(".sense-text").remove()
    }
    container.find(".sense-likes").html(data.likes)
    container.find(".sense-views").html(data.views)

    container.appendTo($(".channel-body"))
  }
})
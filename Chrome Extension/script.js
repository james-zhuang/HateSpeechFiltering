
let cache = {}

let observer = new MutationObserver((mutationRecords, obs) => {
    let tweetLabel = "[data-testid=tweet]"
    if ($(tweetLabel).length > 0) {       //Ensure tweets have loaded
        mutationRecords.forEach(record => {
            record.addedNodes.forEach(node => {
                //traverse to tweet text area
                let tweetArea = $(node).find(tweetLabel).children().last().children().last()
                let tweetContent = $(tweetArea).children().not(":last")
                let tweetToolBar = $(tweetArea).children().last()


                if ($(tweetContent).length > 0) {       //if node is valid tweet

                    if (/Replying to @/.test($(tweetContent).text())) tweetContent = $(tweetContent).not(":first") //Remove unnecessary text in Tweet replies

                    let tweet = $(tweetContent).text()
                    createHateFlag(tweetToolBar, tweetArea, tweetContent)
                    let hateFlag = $(tweetArea).find('[aria-label="Flag Hate Speech"]')

                    //Check if tweet is hate speech and remove if so
                    if (!cache[tweet]) {
                        let urlEndpoint = "https://twitter-hate-speech-api-dot-cs329s-final-project.wl.r.appspot.com"
                        $.ajax({
                            'url' : urlEndpoint + "/predict",
                            'type' : 'GET',
                            'data' : {
                                'text' : tweet
                            },
                            'success' : function(response) {
                                if (response == true) {
                                    //it is hate speech, hide content
                                    cache[tweet] = true
                                    hideContent(tweetArea, tweetContent)
                                    flagRed(hateFlag)
                                }
                            },
                            'error' : function(request,error)
                            {
                                console.log("Request: "+JSON.stringify(request));
                            }
                        })
                    } else {
                        hideContent(tweetArea, tweetContent)
                        flagRed(hateFlag)
                    }
                }
            })
        })
    }
})

observer.observe($("body")[0], {subtree: true, childList: true})

function hideContent (tweetArea, tweetContent) {
    $(tweetContent).hide().removeClass("filtered").off("click")
    let hideMessage = $("<p lang='en' dir='auto' class='r-1fmj7o5 r-1qd0xha r-a023e6 r-16dba41 r-ad9z0x r-bcqeeo r-bnwqim r-qvutc0'> \
                            ⚠ This tweet has been hidden for containing hate speech content. Click to reveal the original tweet. ⚠ \
                        </p>")
    $(tweetContent).first().before(hideMessage)
    $(hideMessage).addClass("filtered").on("click", function(e) {
        e.preventDefault()
        $(hideMessage).remove()
        $(tweetContent).show().addClass("filtered").on("click", function (e) {
            e.preventDefault()
            hideContent(tweetArea, tweetContent)
        })
    })
}

//Adds Tool For Flagging Hate Tweets
function createHateFlag(tweetToolBar, tweetArea, tweetContent) {
    let addIndent = $('<div class="css-1dbjc4n r-xoduu5 r-1udh08x"><span class="css-901oao css-16my406 r-poiln3 r-n6v787 r-1sf4r6n r-1k6nrdp r-1e081e0 r-d3hbe1 r-1wgg2b2 r-axxi2z r-qvutc0"></span></div>')
    $(tweetToolBar).children().last().children().children().append(addIndent)
    let hateFlag = $('<div class="css-1dbjc4n r-18u37iz r-1h0z5md" aria-label="Flag Hate Speech">\
                        <div aria-expanded="false" aria-haspopup="true" role="button" data-focusable="true" tabindex="0" class="css-18t94o4 css-1dbjc4n r-1777fci r-11cpok1 r-1ny4l3l r-bztko3 r-lrvibr">\
                            <div dir="ltr" class="css-901oao r-1awozwy r-9ilb82 r-6koalj r-1qd0xha r-a023e6 r-16dba41 r-1h0z5md r-ad9z0x r-bcqeeo r-o7ynqc r-clp7b1 r-3s2u2q r-qvutc0">\
                                <div class="css-1dbjc4n r-xoduu5">\
                                    <div class="css-1dbjc4n r-1niwhzg r-sdzlij r-1p0dtai r-xoduu5 r-1d2f490 r-xf4iuw r-1ny4l3l r-u8s1d r-zchlnj r-ipm5af r-o7ynqc r-6416eg"></div>\
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" class="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1hdv0qi">\
                                        <path d="M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.314.464L14.5 8l.186.464-.003.001-.006.003-.023.009a12.435 12.435 0 0 1-.397.15c-.264.095-.631.223-1.047.35-.816.252-1.879.523-2.71.523-.847 0-1.548-.28-2.158-.525l-.028-.01C7.68 8.71 7.14 8.5 6.5 8.5c-.7 0-1.638.23-2.437.477A19.626 19.626 0 0 0 3 9.342V15.5a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 1 0v.282c.226-.079.496-.17.79-.26C4.606.272 5.67 0 6.5 0c.84 0 1.524.277 2.121.519l.043.018C9.286.788 9.828 1 10.5 1c.7 0 1.638-.23 2.437-.477a19.587 19.587 0 0 0 1.349-.476l.019-.007.004-.002h.001M14 1.221c-.22.078-.48.167-.766.255-.81.252-1.872.523-2.734.523-.886 0-1.592-.286-2.203-.534l-.008-.003C7.662 1.21 7.139 1 6.5 1c-.669 0-1.606.229-2.415.478A21.294 21.294 0 0 0 3 1.845v6.433c.22-.078.48-.167.766-.255C4.576 7.77 5.638 7.5 6.5 7.5c.847 0 1.548.28 2.158.525l.028.01C9.32 8.29 9.86 8.5 10.5 8.5c.668 0 1.606-.229 2.415-.478A21.317 21.317 0 0 0 14 7.655V1.222z"/>\
                                    </svg>\
                                </div>\
                            </div>\
                        </div>\
                    </div>')
    //$(tweetToolBar).append(hateFlag).append('<span> Flag / Unflag tweet as hate speech </span>')

    $(hateFlag).mouseenter(function() {
            flagRed(hateFlag)
    })
    $(hateFlag).mouseleave(function() {
        if (tweetArea.find('.filtered').length > 0 )
            flagRed(hateFlag)
        else
            flagNormal(hateFlag)
    })
    $(hateFlag).click(function() {
        toggleHateFilter(tweetArea, tweetContent)
    })
}

function toggleHateFilter(tweetArea, tweetContent) {
    let hideMessage = tweetArea.find('p')
    let sendTweet = false
    let hateFlag = $(tweetArea).find('[aria-label="Flag Hate Speech"]')

    if ($(hideMessage).length > 0) {                    //Tweet currently labeled as hate speech
        $(hideMessage).remove()
        $(tweetContent).show().removeClass("filtered")
        flagNormal(hateFlag)
    } else if ($(tweetContent).hasClass("filtered")) {  //Tweet currently labeled as hate speech
        $(tweetContent).off("click")
        $(tweetContent).removeClass("filtered")
        flagNormal(hateFlag)
    } else {                                            //Tweet not labeled as hate speech
        hideContent(tweetArea, tweetContent)
        flagRed(hateFlag)
        sendTweet = true
    }

    if (sendTweet) {
        let tweet = $(tweetContent).text()
        // Report text for being hate speech
    } else {
        // Report text for not being hate speech
    }
}

function flagRed(hateFlag) {
    $(hateFlag).children().children().removeClass("r-9ilb82").addClass('r-daml9f-hs').children().children().first().removeClass('r-1niwhzg').addClass('r-wcu338-hs')
}

function flagNormal(hateFlag) {
    $(hateFlag).children().children().removeClass("r-daml9f-hs").addClass('r-9ilb82').children().children().first().removeClass('r-wcu338-hs').addClass('r-1niwhzg')
}


let tweetLabel = "[data-testid=tweet]"

let observer = new MutationObserver((mutationRecords, obs) => {
    if ($(tweetLabel).length > 0) {       //Ensure tweets have loaded
        mutationRecords.forEach(record => {
            record.addedNodes.forEach(node => {
                //traverse to tweet text area
                let tweetArea = $(node).find(tweetLabel).children().last().children().last()
                let tweetContent = $(tweetArea).children().not(":last")
                
                if ($(tweetContent).length > 0) {       //if node is valid tweet
                    let tweet = $(tweetContent).text()
                    // console.log("tweet: " + tweet)
                    //code here to check if tweet is hate speech
                    // if is hate speech
                    let urlEndpoint = "http://127.0.0.1:8000"
                    $.ajax({
                        'url' : urlEndpoint + "/predict",
                        'type' : 'GET',
                        'data' : {
                            'text' : tweet
                        },
                        'success' : function(response) {              
                            if (response == true) {
                                //it is hate speech, hide content
                                hideContent(tweetArea, tweetContent)
                            }
                        },
                        'error' : function(request,error)
                        {
                            console.log("Request: "+JSON.stringify(request));
                        }
                    })
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
    $(tweetArea).prepend(hideMessage)
    $(hideMessage).addClass("filtered").on("click", function(e) {
        e.preventDefault()
        $(hideMessage).remove()
        $(tweetContent).show().addClass("filtered").on("click", function (e) {
            e.preventDefault()
            hideContent(tweetArea, tweetContent)
        })
    })
}

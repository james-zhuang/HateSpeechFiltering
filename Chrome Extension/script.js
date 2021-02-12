
let tweetLabel = "[data-testid=tweet]"

let observer = new MutationObserver((mutationRecords, obs) => {
    if ($(tweetLabel).length > 0) {                    //Tweets have loaded
        mutationRecords.forEach(record => {
            record.addedNodes.forEach(node => {
                //traverse to tweet text area
                let tweetArea = $(node).find(tweetLabel).children().last().children().last()
                let tweetContent = $(tweetArea).children().not(":last")
                if ($(tweetContent).length > 0) {
                    console.log("tweet: " + $(tweetContent).text())
                    $(tweetContent).hide()
                    $(tweetArea).prepend("<div class='css-1dbjc4n'> \
                                            <p lang='en' dir='auto' class='r-1fmj7o5 r-1qd0xha r-a023e6 r-16dba41 r-ad9z0x r-bcqeeo r-bnwqim r-qvutc0'> \
                                                This tweet has been hidden. Clicked to show the original tweet. \
                                            </p> \
                                        </div>")
                    console.log(tweetContent)
                }
            })
        })
    }

    // if ( $("nav").length >= 2) {                                    // Make sure Twitter has loaded tweet area
    //     feed = $("div[aria-label='Timeline: Tweet’s Tweets']")      // Tweet feed container
    //     mutationRecords.forEach(record => {
    //         record.addedNodes.forEach(node => {
    //             if ($(feed).has(node).length > 0) {                 // Node is in tweet area
    //                 if ($(node).has("[data-testid=tweet]").length > 0) {        // Node contains tweet
    //                     // console.log(record)
    //                     // console.log("node: " + $(node).text())
    //                     console.log($(node).has("article"))
    //                     $(node).addClass("tweet")
    //                 }
    //             }
    //         })
    //     })
    // }
})

observer.observe($("body")[0], {subtree: true, childList: true})

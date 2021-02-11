
let tweetLabel = "[data-testid=tweet]"

let observer = new MutationObserver((mutationRecords, obs) => {
    if ($(tweetLabel).length > 0) {                    //Tweets have loaded
        mutationRecords.forEach(record => {
            record.addedNodes.forEach(node => {
                //traverse to tweet text area
                let tweetContent = $(node).find(tweetLabel).children().last().children().last().children().not(":last")
                if ($(tweetContent).length > 0) {
                    $(tweetContent).addClass("tweet")
                    console.log("tweet: " + $(tweetContent).text())
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

# se-graph
Generate StackExchange CSV of user's progression.

# Usage

Get a list of users from any Stack Exchange website with the following script:

    $('.user-details').map((i,e)=>$(e).find('a').attr('href').replace('/users/',''));

E.g.:


    http://vi.stackexchange.com/users?tab=Reputation&filter=all

    => ["51/carpetsmoker", "54/romainl", "205/muru", "1841/statox", "1821/nobe4", "71/christian-brabandt", "970/ingo-karkat", "1800/vanlaser", "778/peter-rincker", "467/kenorb", "15/jamessan", "4939/saginaw", "88/doorknob", "1405/mmontu", "227/john-om", "64/tommcdo", "865/evergreentree", "5229/tommy-a", "626/luc-hermitte", "21/karl-yngve-lerv%c3%a5g", "2920/dj-mcmayhem", "24/200-success", "72/josh-petrie", "246/akshay", "343/rich", "2055/garyjohn", "1577/lcd047", "6489/tumbler41", "6960/user9433424", "74/dhruva-sagar", "2313/sato-katsura", "13/toro2k", "895/jecxjo", "4676/wildcard", "680/matt-boehm", "53/thameera"]

Set the variables at the end of `index.js`, following the example.

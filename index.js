var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var fs = require('fs');

// Fetch the url and return the cheerio html element
function get(url, done, failed){
  failed = failed || console.log;

  request(
    {
      'url': url,
      'timeout': 10000,
    },
    function (error, response, html) {
      if (!error && response.statusCode == 200) {
        done( cheerio.load(html));
      } else {
        // force it
        get(url, done, failed);
      }
    }
  );
}

// Concat generate an array of objects, flatten it
function async_concat_callback(callback){
  return function(err, array){

    var object = {};

    for(var i in array){
      for(var o in array[i]){
        object[o] = array[i][o];
      }
    }

    callback(object);

  }
}

// Build the reputation page url
function reputation_url(user, page_number){
  return base_url + "users/" + user +"?tab=reputation&sort=post&page=" + page_number;
}

// Write the data to the the export.csv file
function write_to_csv(data, field){
  var stream = fs.createWriteStream("export.csv");

  stream.once('open', function(fd) {

    // Write the header name
    stream.write('names,' + data['names'].join(',') + '\n');

    // Join each column with `,` and each row with `\n`
    stream.write(
        data[field]
        .map(function(a){
          return a.join(',');
        }).join('\n'));

    // Write once and close the stream
    stream.end();

  });
}

function generate_csv_table(result) {
  var user_number = Object.keys(result).length;

  var table = { 'names' : [] };
  var date_table = {};

  var column = 0;

  // Merge all users reputation into a unique table
  for(user in result) {
    table['names'].push(user);

    var rows = result[user];

    for(var date in rows) {

      if(!date_table[date]){
        date_table[date] = Array(user_number).fill(0);
      }

      date_table[date][column] = rows[date];

    }

    column++;
  }

  // Build the reputation table
  var reputation_table = [];

  for(var date in date_table){
    var row = date_table[date];
    row.unshift(date);
    reputation_table.push(row);
  }

  reputation_table.sort();

  // Build the progress table
  var progress_table = JSON.parse(JSON.stringify(reputation_table));

  for(var i = 0; i < progress_table.length; i ++){

    // Convert timestamps to dates
    progress_table[i][0] = reputation_table[i][0] = (new Date(+reputation_table[i][0])).toDateString();

    if( i == 0 ) continue;

    for(var j = 0; j <  user_number; j ++){
      progress_table[i][1+j] += progress_table[i-1][1+j];
    }

  }

  table['reputation'] = reputation_table;
  table['progress'] = progress_table;

  return table;
}

function get_reputation_page_number(user, callback){
  // We assume the page number is not more than 9999 (approx 500 years with 20 days/page, should be fine)
  get(reputation_url(user, 9999),function($){

    var last_page = $('#user-tab-reputation .user-tab-footer .user-tab-paging > div > a:last-child').text();
    callback(parseInt(last_page) || 1);

  });
}

// Get reputation rows for a page
function get_reputation_rows_for_page(user, page_number, callback){
  var rows = {};

  get(reputation_url(user, page_number), function($){

    var reputation_rows = $('.rep-table-row');

    reputation_rows.each(function(i, e){

      // find the reputation value
      var value = parseInt($(e).find('.rep-cell').text());

      // find the date
      var date = new Date($(e).find('.rep-day').attr('title'));

      // Use the timestamp as the key
      rows[date.getTime()] = value;

    });

    callback(rows);

  });
}

// Get reputations row for a user
function get_reputation_rows_for_user(user, callback){
  get_reputation_page_number(user, function(number_of_pages){

    // Create a 1, ..., number_of_pages array
    var array_of_pages = Array(number_of_pages).fill(0).map((e,i)=>i+1);

    // For each page, get the reputations rows and concatenate them
    async.concat(

        array_of_pages,

        function(page_number, done){

          get_reputation_rows_for_page(user, page_number, function(reputation_rows){

            done(null, reputation_rows);

          });

        }, async_concat_callback(callback));

  });
}

// Get reputations rows for each user
function get_reputation_rows_for_users(users, callback){
  async.concat(

      users,

      function(user, done){

        get_reputation_rows_for_user(user, function(reputation_rows){

          var reputation = {};
          reputation[user] = reputation_rows;

          done(null, reputation);

        });

      }, async_concat_callback(callback));
}

// Set the variables here:
var base_url = "http://vi.stackexchange.com/";
var users_id = ["51/carpetsmoker", "54/romainl", "205/muru", "1841/statox", "1821/nobe4", "71/christian-brabandt", "970/ingo-karkat", "1800/vanlaser", "778/peter-rincker", "467/kenorb", "15/jamessan", "4939/saginaw"];

get_reputation_rows_for_users(users_id, function(result){
  var csv_table = generate_csv_table(result);
  write_to_csv(csv_table, 'progress');
});

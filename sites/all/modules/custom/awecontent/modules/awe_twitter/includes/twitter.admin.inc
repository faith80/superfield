<?php
define('CONSUMER_KEY', variable_get('consumer_key', '14XiEso9DKiEkhdejwvfLA'));
define('CONSUMER_SECRET', variable_get('consumer_secret', 'K1IcprfP7ZtHW9SM9pag9YWJ0jUWi6vAWZ3hX2FvspI'));

// User Access Token
define('ACCESS_TOKEN', variable_get('access_token', '234626957-zSPIRl4nvdXvzffaXjZUZNVFxleenIQjOS2B749p'));
define('ACCESS_SECRET', variable_get('access_secret', 'PAiDJWzd1nqVm2pzMnnFeY5OW1OiCieXSqkivO6PUM'));

require_once(drupal_get_path('module', 'awe_twitter') . '/includes/twitteroauth.inc');
// If count of tweets is not fall back to default setting


/**
 * Gets connection with user Twitter account
 * @param  String $cons_key Consumer Key
 * @param  String $cons_secret Consumer Secret Key
 * @param  String $oauth_token Access Token
 * @param  String $oauth_secret Access Secrete Token
 * @return Object               Twitter Session
 */
function getConnectionWithToken($cons_key, $cons_secret, $oauth_token, $oauth_secret) {
  $connection = new TwitterOAuth($cons_key, $cons_secret, $oauth_token, $oauth_secret);
  return $connection;
}

function ac_twitter_get_data() {
  $username = filter_input(INPUT_GET, 'username', FILTER_SANITIZE_SPECIAL_CHARS);
  $number = filter_input(INPUT_GET, 'count', FILTER_SANITIZE_NUMBER_INT);
  $exclude_replies = filter_input(INPUT_GET, 'exclude_replies', FILTER_SANITIZE_SPECIAL_CHARS);
  $list_slug = filter_input(INPUT_GET, 'list_slug', FILTER_SANITIZE_SPECIAL_CHARS);
  $hashtag = filter_input(INPUT_GET, 'hashtag', FILTER_SANITIZE_SPECIAL_CHARS);
  if (CONSUMER_KEY === '' || CONSUMER_SECRET === '' || CONSUMER_KEY === 'CONSUMER_KEY_HERE' || CONSUMER_SECRET === 'CONSUMER_SECRET_HERE') {
    echo 'You need a consumer key and secret keys. Get one from <a href="https://dev.twitter.com/apps">dev.twitter.com/apps</a>';
    exit;
  }

  if (cache_get('awe_twitter')) {
    $tweets = cache_get('awe_twitter');
    $tweets = $tweets->data;
  }
  else {
    $connection = getConnectionWithToken(CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_SECRET);
    if (!empty($list_slug)) {
      $params = array(
        'owner_screen_name' => $username,
        'slug' => $list_slug,
        'per_page' => $number
      );
      $url = '/lists/statuses';
    }
    else {
      if ($hashtag) {
        $params = array(
          'count' => $number,
          'q' => '#' . $hashtag
        );

        $url = '/search/tweets';
      }
      else {
        $params = array(
          'count' => $number,
          'exclude_replies' => $exclude_replies,
          'screen_name' => $username
        );

        $url = '/statuses/user_timeline';
      }
    }
    $tweets = $connection->get($url, $params);
    cache_set('awe_twitter', $tweets, 'cache', time() + 60 * 60);
  }
  header('Content-Type: application/json');
  $tweets = json_encode($tweets);
  echo $tweets;
  exit;
}


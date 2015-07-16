<?php

/**
 * Plugin Name: Data Tables Generator by Supsystic
 * Plugin URI: http://supsystic.com
 * Description: Create and manage beautiful data tables with custom design. No HTML knowledge is required
 * Version: 1.0.9
 * Author: supsystic.com
 * Author URI: http://supsystic.com
 */

include dirname(__FILE__) . '/app/SupsysticTables.php';

if (!defined('SUPSYSTIC_TABLES_SHORTCODE_NAME')) {
    define('SUPSYSTIC_TABLES_SHORTCODE_NAME', 'supsystic-tables');
}

$supsysticTables = new SupsysticTables();
$supsysticTables->activate(__FILE__);
$supsysticTables->run();

if (!function_exists('supsystic_tables_get')) {
    function supsystic_tables_get($id)
    {
        return do_shortcode(sprintf('[%s id="%d"]', SUPSYSTIC_TABLES_SHORTCODE_NAME, (int)$id));
    }
}

if (!function_exists('supsystic_tables_display')) {
    function supsystic_tables_display($id)
    {
        echo supsystic_tables_get($id);
    }
}

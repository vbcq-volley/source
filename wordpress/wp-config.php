<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the website, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'vbcq' );

/** Database username */
define( 'DB_USER', 'vbcqAdmin' );

/** Database password */
define( 'DB_PASSWORD', 'admin' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'Q$XM(*kXo|WWeHqDKYg773x<kJ=pyC$VGnnXy6(~LL& 0knG.R4!1Rm% }gppU 3' );
define( 'SECURE_AUTH_KEY',  '4XQzoIyt`AJo&+ BqsADIb$Kc]g>hY6 ^r>MI(hL<zFBs [c9|~g>Drz+mG2P3Uw' );
define( 'LOGGED_IN_KEY',    '{+`n^P4!S`](d2ES=m*j_4nML0uQsm*qYSGyg9RLtejRl1`hr]|+gThX;aw[P&3U' );
define( 'NONCE_KEY',        '4h6&|j5.6s/_[{GsaiClUZVNN:TgK2>SY_W.7^#(4kd.?$0ztr5Kzu||c9boz3_N' );
define( 'AUTH_SALT',        't`_Hb8+1b(Pk*dT[=Vwf5Qp!Rf893k!JF>mT8eJ.;n=MVB2`Od#hSvH_R3?Gd9Sx' );
define( 'SECURE_AUTH_SALT', ')*>N4=75$}RQKSRrid0{SbgEh*TV[LLK.s^BV@an{%Mx2Otf6xuvrjTwn2n#L$(?' );
define( 'LOGGED_IN_SALT',   'ud0bYx%EHej9-(~qPq3pn_g^PB:R6K93b0yinpoG4R6@EtM.9%>}<%GVadW$<SFm' );
define( 'NONCE_SALT',       'qd`Lk7SVcbKqlB<G32[3xAFj{_`b^Lc08&VnGym#/Vjyq0}rRUo&GuU]w#V%;,*g' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 *
 * At the installation time, database tables are created with the specified prefix.
 * Changing this value after WordPress is installed will make your site think
 * it has not been installed.
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/#table-prefix
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';

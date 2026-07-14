<?php
/**
 * Grid 2 columnas — Club de actualización / Comunica-t (intro + video + tarjeta).
 *
 * @package esitef-minimal
 *
 * @var array<string, mixed> $args
 */

$hub  = isset( $args['hub'] ) ? $args['hub'] : array();
$grid = isset( $hub['content_grid'] ) && is_array( $hub['content_grid'] ) ? $hub['content_grid'] : array();

$variant             = isset( $grid['variant'] ) ? (string) $grid['variant'] : '';
$intro               = isset( $grid['intro'] ) ? (string) $grid['intro'] : '';
$eyebrow             = isset( $grid['eyebrow'] ) ? (string) $grid['eyebrow'] : '';
$card_title          = isset( $grid['card_title'] ) ? (string) $grid['card_title'] : '';
$paragraphs          = isset( $grid['paragraphs'] ) && is_array( $grid['paragraphs'] ) ? $grid['paragraphs'] : array();
$card_footer         = isset( $grid['card_footer'] ) ? (string) $grid['card_footer'] : '';
$card_image          = isset( $grid['card_image'] ) ? (string) $grid['card_image'] : '';
$card_image_alt      = isset( $grid['card_image_alt'] ) ? (string) $grid['card_image_alt'] : $card_title;
$goals_title         = isset( $grid['goals_title'] ) ? (string) $grid['goals_title'] : '';
$goals               = isset( $grid['goals'] ) && is_array( $grid['goals'] ) ? $grid['goals'] : array();
$video               = isset( $grid['video'] ) ? (string) $grid['video'] : '';
$video_title         = isset( $grid['video_title'] ) ? (string) $grid['video_title'] : __( 'Presentación del programa', 'esitef-minimal' );
$audience_title      = isset( $grid['audience_title'] ) ? (string) $grid['audience_title'] : '';
$audience_lead       = isset( $grid['audience_lead'] ) ? (string) $grid['audience_lead'] : '';
$audience_body       = isset( $grid['audience_body'] ) ? (string) $grid['audience_body'] : '';
$middle_paragraphs   = isset( $grid['middle_paragraphs'] ) && is_array( $grid['middle_paragraphs'] ) ? $grid['middle_paragraphs'] : array();
$audience_paragraphs = isset( $grid['audience_paragraphs'] ) && is_array( $grid['audience_paragraphs'] ) ? $grid['audience_paragraphs'] : array();
$audience_image      = isset( $grid['audience_image'] ) ? (string) $grid['audience_image'] : '';
$audience_image_mobile = isset( $grid['audience_image_mobile'] ) ? (string) $grid['audience_image_mobile'] : '';
$audience_alt        = isset( $grid['audience_image_alt'] ) ? (string) $grid['audience_image_alt'] : $audience_title;
$vimeo_url           = $video ? esitef_hub_vimeo_embed_url( $video ) : '';

if ( '' === $intro && ! $paragraphs && ! $goals && ! $card_title && ! $audience_body && ! $audience_paragraphs && ! $middle_paragraphs && ! $video ) {
	return;
}

if ( 'video-left' === $variant ) :
	?>
<section class="hub-club-grid hub-club-grid--video-left">
  <div class="hub-club-grid__inner">
    <?php if ( $vimeo_url ) : ?>
    <article class="hub-club-grid__video hub-club-card">
      <div class="hub-club-card__video-frame">
        <iframe src="<?php echo esc_url( $vimeo_url ); ?>" title="<?php echo esc_attr( $video_title ); ?>" frameborder="0" allowfullscreen allow="autoplay; encrypted-media; picture-in-picture"></iframe>
      </div>
    </article>
    <?php endif; ?>

    <div class="hub-club-grid__right">
      <article class="hub-club-grid__includes hub-club-card hub-club-grid__includes--text-only">
        <div class="hub-club-grid__includes-text">
          <?php if ( $card_title ) : ?>
          <h3 class="hub-club-card__subtitle"><?php echo esc_html( $card_title ); ?></h3>
          <?php endif; ?>
          <?php foreach ( $paragraphs as $paragraph ) : ?>
          <p class="hub-club-card__body"><?php echo esc_html( $paragraph ); ?></p>
          <?php endforeach; ?>
          <?php if ( $card_footer ) : ?>
          <p class="hub-club-card__body hub-club-card__body--emphasis"><?php echo esc_html( $card_footer ); ?></p>
          <?php endif; ?>
        </div>
      </article>

      <?php if ( $audience_body || $audience_title || $audience_lead || $middle_paragraphs || $audience_paragraphs ) : ?>
      <article class="hub-club-grid__audience hub-club-card<?php echo $audience_image ? '' : ' hub-club-grid__audience--text-only'; ?>">
        <div class="hub-club-grid__audience-text">
          <?php if ( $audience_lead ) : ?>
          <h3 class="hub-club-card__subtitle"><?php echo esc_html( $audience_lead ); ?></h3>
          <?php endif; ?>
          <?php foreach ( $middle_paragraphs as $middle_paragraph ) : ?>
          <p class="hub-club-card__body"><?php echo esc_html( $middle_paragraph ); ?></p>
          <?php endforeach; ?>
          <?php if ( $audience_title ) : ?>
          <h3 class="hub-club-card__subtitle"><?php echo esc_html( $audience_title ); ?></h3>
          <?php endif; ?>
          <?php if ( $audience_body ) : ?>
          <p class="hub-club-card__body"><?php echo esc_html( $audience_body ); ?></p>
          <?php endif; ?>
          <?php foreach ( $audience_paragraphs as $audience_paragraph ) : ?>
          <p class="hub-club-card__body"><?php echo esc_html( $audience_paragraph ); ?></p>
          <?php endforeach; ?>
        </div>
        <?php if ( $audience_image ) : ?>
        <div class="hub-club-grid__audience-media">
          <?php if ( $audience_image_mobile ) : ?>
          <img class="hub-club-grid__audience-img hub-club-grid__audience-img--mobile" src="<?php echo esc_url( $audience_image_mobile ); ?>" alt="<?php echo esc_attr( $audience_alt ); ?>" loading="lazy" width="1200" height="675">
          <?php endif; ?>
          <img class="hub-club-grid__audience-img hub-club-grid__audience-img--desktop<?php echo $audience_image_mobile ? '' : ' hub-club-grid__audience-img--only'; ?>" src="<?php echo esc_url( $audience_image ); ?>" alt="<?php echo esc_attr( $audience_alt ); ?>" loading="lazy" width="600" height="700">
        </div>
        <?php endif; ?>
      </article>
      <?php endif; ?>
    </div>
  </div>
</section>
	<?php
	return;
endif;
?>
<section class="hub-club-grid">
  <div class="hub-club-grid__inner">
    <article class="hub-club-grid__main hub-club-card">
      <?php if ( $eyebrow ) : ?>
      <p class="hub-club-card__eyebrow"><?php echo esc_html( $eyebrow ); ?></p>
      <?php endif; ?>
      <?php if ( $card_title ) : ?>
      <h2 class="hub-club-card__brand"><?php echo esc_html( $card_title ); ?></h2>
      <?php endif; ?>
      <?php if ( $intro ) : ?>
      <p class="hub-club-card__intro"><?php echo esc_html( $intro ); ?></p>
      <?php endif; ?>
      <?php foreach ( $paragraphs as $paragraph ) : ?>
      <p class="hub-club-card__paragraph"><?php echo esc_html( $paragraph ); ?></p>
      <?php endforeach; ?>
      <?php if ( $goals_title ) : ?>
      <h2 class="hub-club-card__title"><?php echo esc_html( $goals_title ); ?></h2>
      <?php endif; ?>
      <?php if ( $goals ) : ?>
      <ul class="hub-club-card__list">
        <?php foreach ( $goals as $goal ) : ?>
        <li><?php echo esc_html( $goal ); ?></li>
        <?php endforeach; ?>
      </ul>
      <?php endif; ?>
    </article>

    <div class="hub-club-grid__aside">
      <?php if ( $vimeo_url ) : ?>
      <article class="hub-club-grid__video hub-club-card">
        <div class="hub-club-card__video-frame">
          <div class="tutor-ratio tutor-ratio-16x9">
            <iframe src="<?php echo esc_url( $vimeo_url ); ?>" title="<?php echo esc_attr( $video_title ); ?>" frameborder="0" allowfullscreen allow="autoplay; encrypted-media; picture-in-picture"></iframe>
          </div>
        </div>
      </article>
      <?php endif; ?>

      <?php if ( $audience_body || $audience_title || $audience_paragraphs ) : ?>
      <article class="hub-club-grid__audience hub-club-card<?php echo $audience_image ? '' : ' hub-club-grid__audience--text-only'; ?>">
        <div class="hub-club-grid__audience-text">
          <?php if ( $audience_title ) : ?>
          <h3 class="hub-club-card__subtitle"><?php echo esc_html( $audience_title ); ?></h3>
          <?php endif; ?>
          <?php if ( $audience_body ) : ?>
          <p class="hub-club-card__body"><?php echo esc_html( $audience_body ); ?></p>
          <?php endif; ?>
          <?php foreach ( $audience_paragraphs as $audience_paragraph ) : ?>
          <p class="hub-club-card__body"><?php echo esc_html( $audience_paragraph ); ?></p>
          <?php endforeach; ?>
        </div>
        <?php if ( $audience_image ) : ?>
        <div class="hub-club-grid__audience-media">
          <?php if ( $audience_image_mobile ) : ?>
          <img class="hub-club-grid__audience-img hub-club-grid__audience-img--mobile" src="<?php echo esc_url( $audience_image_mobile ); ?>" alt="<?php echo esc_attr( $audience_alt ); ?>" loading="lazy" width="1200" height="675">
          <?php endif; ?>
          <img class="hub-club-grid__audience-img hub-club-grid__audience-img--desktop<?php echo $audience_image_mobile ? '' : ' hub-club-grid__audience-img--only'; ?>" src="<?php echo esc_url( $audience_image ); ?>" alt="<?php echo esc_attr( $audience_alt ); ?>" loading="lazy" width="600" height="700">
        </div>
        <?php endif; ?>
      </article>
      <?php endif; ?>
    </div>
  </div>
</section>

<?php
/**
 * Landing purchase — Tutor enroll / add to cart.
 *
 * @package esitef-minimal
 */
?>
<div class="landing-purchase-bar">
	<div class="landing-enroll-wrap">
		<?php
		if ( function_exists( 'tutor_load_template' ) ) {
			tutor_load_template( 'single.course.course-entry-box' );
		}
		?>
	</div>
</div>

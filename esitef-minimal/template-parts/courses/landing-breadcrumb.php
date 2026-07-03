<?php
/**
 * Landing breadcrumb — mobile route label.
 *
 * @package esitef-minimal
 */
?>
<nav class="landing-breadcrumb" aria-label="<? esc_attr_e( 'Ruta', 'esitef-minimal' ); ?>">
	<span><? esc_html_e( 'Cursos', 'esitef-minimal' ); ?></span>
	<span class="landing-breadcrumb__sep" aria-hidden="true">/</span>
	<span class="landing-breadcrumb__current"><?php the_title(); ?></span>
</nav>

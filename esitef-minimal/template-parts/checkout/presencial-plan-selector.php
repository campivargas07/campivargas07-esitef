<?php
/**
 * Presencial plan selector — Polar style.
 *
 * @package esitef-minimal
 *
 * @var array<string, mixed> $args
 */

$instance     = isset( $args['instance'] ) ? (string) $args['instance'] : '';
$current_plan = isset( $args['current_plan'] ) ? (string) $args['current_plan'] : '';
$config       = isset( $args['config'] ) && is_array( $args['config'] ) ? $args['config'] : array();
$plans        = isset( $config['plans'] ) && is_array( $config['plans'] ) ? $config['plans'] : array();

if ( ! $instance || ! $plans ) {
	return;
}
?>
<section class="checkout-plan-block" data-presencial-instance="<?php echo esc_attr( $instance ); ?>">
	<p class="checkout-plan-block__title"><?php esc_html_e( 'Forma de pago', 'esitef-minimal' ); ?></p>
	<div class="checkout-plans polar-plans" role="radiogroup" aria-label="<?php esc_attr_e( 'Plan de pago presencial', 'esitef-minimal' ); ?>">
		<?php foreach ( $plans as $plan_key => $plan ) : ?>
			<?php
			$selected  = $plan_key === $current_plan;
			$highlight = ! empty( $plan['highlight'] );
			$classes   = array( 'checkout-plan' );
			if ( $selected ) {
				$classes[] = 'checkout-plan--selected';
			}
			if ( $highlight ) {
				$classes[] = 'checkout-plan--highlight';
			}
			?>
			<button
				type="button"
				class="<?php echo esc_attr( implode( ' ', $classes ) ); ?>"
				data-plan="<?php echo esc_attr( $plan_key ); ?>"
				role="radio"
				aria-checked="<?php echo $selected ? 'true' : 'false'; ?>"
			>
				<?php if ( $highlight ) : ?>
					<span class="checkout-plan__badge"><?php esc_html_e( 'Recomendado', 'esitef-minimal' ); ?></span>
				<?php endif; ?>
				<div class="checkout-plan__top">
					<span class="checkout-plan__name"><?php echo esc_html( $plan['name'] ?? $plan_key ); ?></span>
					<span class="checkout-plan__amount"><?php echo esc_html( $plan['amount_display'] ?? '' ); ?></span>
				</div>
				<?php if ( ! empty( $plan['period'] ) ) : ?>
					<span class="checkout-plan__period"><?php echo esc_html( $plan['period'] ); ?></span>
				<?php endif; ?>
			</button>
		<?php endforeach; ?>
	</div>
</section>

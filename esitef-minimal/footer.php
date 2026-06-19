    <footer id="colophon" class="site-footer">
        <style>
            .site-footer {
                background: var(--color-bg-secondary);
                border-top: 1px solid var(--color-border);
                padding: 40px 0 20px;
                margin-top: 60px;
                text-align: center;
                color: var(--color-text-muted);
            }
            .site-footer p {
                font-size: 0.9rem;
            }
        </style>
        <div class="container footer-container">
            <div class="site-info">
                <p>&copy; <?php echo date('Y'); ?> <?php bloginfo('name'); ?>. Formación Continua en Fisioterapia.</p>
            </div>
        </div>
    </footer>
</div><!-- #page -->
<?php wp_footer(); ?>
</body>
</html>

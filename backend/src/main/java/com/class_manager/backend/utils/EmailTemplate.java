package com.class_manager.backend.utils;

import java.time.LocalDate;

import com.class_manager.backend.dto.config_properties.EmailTemplateProperties;

public class EmailTemplate {

	private final EmailTemplateProperties emailTemplateProperties;
	private final String institution;

	public EmailTemplate(EmailTemplateProperties emailTemplateProperties, String institution) {
		this.institution = institution;
		this.emailTemplateProperties = emailTemplateProperties;
    }

	public String getResetPasswordTemplate(String name, String link) {
		return """
					<!DOCTYPE html>
					<html lang="pt-BR">
					<head>
						<meta charset="UTF-8">
						<meta name="viewport" content="width=device-width, initial-scale=1.0">
						<style>
							body {
								font-family: Arial, sans-serif;
								margin: 0;
								padding: 0;
								background-color: %s;
								color: %s !important;
							}
							.container {
								width: 100%%;
								max-width: 600px;
								margin: 0 auto;
								background-color: %s;
								border-radius: 5px;
								overflow: hidden;
								box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
							}
							.header {
								width: 100%%;
								background-color: %s;
								padding: 20px;
							}
							.header h1 {
								width: 80%%;
								max-height: 200px;
								display: block;
								margin: 0 auto;
								color: %s !important;
							}
							.content {
								padding: 20px;
							}
							.button {
								display: inline-block;
								padding: 10px 20px;
								margin: 20px 0;
								text-decoration: none;
								background-color: %s;
								color: %s !important;
								border-radius: 5px;
							}
							.footer {
								background-color: %s;
								text-align: center;
								padding: 10px;
								font-size: 12px;
								color: %s !important;
							}
							@media (max-width: 600px) {
								.container {
									width: 100%%;
								}
							}
						</style>
					</head>
					<body>
						<div class="container">
							<div class="header">
								<h1>%s</h1>
							</div>
							<div class="content">
								<h1>Redefinição de Senha</h1>
								<br>
								<h2>Olá, %s.</h2>
								<p>Recebemos um pedido para redefinir sua senha. Clique no botão abaixo para criar uma nova senha.</p>
								<a href="%s" class="button">Redefinir Senha</a>
								<p>Se você não solicitou a redefinição de senha, ignore este e-mail.</p>
								<p>Atenciosamente,<br>%s</p>
							</div>
							<div class="footer">
								<p>&copy; %d %s. Todos os direitos reservados.</p>
							</div>
						</div>
					</body>
					</html>
				"""
				.formatted(
						// CSS Properties
						emailTemplateProperties.bodyBackground(),
						emailTemplateProperties.bodyFont(),
						emailTemplateProperties.bodyBackground(),
						emailTemplateProperties.headerBackground(),
						emailTemplateProperties.headerFont(),
						emailTemplateProperties.bodyBackground(),
						emailTemplateProperties.buttonFont(),
						emailTemplateProperties.footerBackground(),
						emailTemplateProperties.footerFont(),
						// HTML Properties
						institution,
						name,
						link,
						institution,
						LocalDate.now().getYear(),
						institution);
	}
}

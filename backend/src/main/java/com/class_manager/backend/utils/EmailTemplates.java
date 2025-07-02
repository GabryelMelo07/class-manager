package com.class_manager.backend.utils;

import java.time.LocalDate;

public class EmailTemplates {
	private static final String DEFAULT_TEMPLATE = """
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
								width: 100%%;
								background-color: #ffffff;
								color: #1a1a1a !important;
							}
							.container {
								width: 100%%;
								max-width: 600px;
								margin: 0 auto;
								background-color: #f1f1f1;
								border-radius: 5px;
								overflow: hidden;
								box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
							}
							.header {
								width: 100%%;
								background-color: #721cb8;
								padding: 20px;
							}
							.header h1 {
								width: 80%%;
								max-height: 200px;
								display: block;
								margin: 0 auto;
								color: #f1f1f1 !important;
							}
							.content {
								padding: 20px;
								font-size: 16px;
							}
							.button {
								display: inline-block;
								padding: 10px 20px;
								margin: 20px 0;
								text-decoration: none;
								background-color: #e4e4e4;
								color: #1a1a1a !important;
								border-radius: 5px;
							}
							.footer {
								background-color: #1a1a1a;
								text-align: center;
								padding: 10px;
								font-size: 12px;
								color: #f1f1f1 !important;
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
								<h1>Class Manager</h1>
							</div>
							<div class="content">
								%s
							</div>
							<div style="padding-left: 20px; font-size: 16px;">
								<p>Atenciosamente,<br>
									<strong>Class Manager.</strong>
								</p>
							</div>
							<div class="footer">
								<p>&copy; %d Class Manager. Todos os direitos reservados.</p>
							</div>
						</div>
					</body>
					</html>
			""";

	public static String getResetPasswordTemplate(String name, String link) {
		String content = """
			<h1>Redefinição de Senha</h1>
			<br>
			<h2>Olá, %s.</h2>
			<p>Recebemos um pedido para redefinir sua senha. Clique no botão abaixo para criar uma nova senha.</p>
			<a href="%s" class="button">Redefinir Senha</a>
			<p>Se você não solicitou a redefinição de senha, ignore este e-mail.</p>
		""".formatted(name, link);
		return DEFAULT_TEMPLATE.formatted(content, LocalDate.now().getYear());
	}

	public static String getSchedulesTemplate(String courseName, String semesterName) {
		String content = """
			<h1>Horários de aula do curso: %s</h1>
			<br>
			<h2>Olá,</h2>
			<p>Anexado neste e-mail, encontra-se o arquivo PDF com os horários de aula do curso: <strong>%s</strong>, referente ao semestre: <strong>%s</strong>.</p>
		""".formatted(courseName, courseName, semesterName);
		return DEFAULT_TEMPLATE.formatted(content, LocalDate.now().getYear());
	}
	
}

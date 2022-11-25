<?php
require_once '../service/core.service.php';
$coreService = new CoreService();

require_once $coreService->requireConfig();
require_once '../service/auth.service.php';

$coreService->setHeader();

$authService = new AuthService();
echo $authService->authenticate();
?>

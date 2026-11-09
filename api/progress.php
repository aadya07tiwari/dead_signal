<?php
// PHP integration points (stubs). Called via fetch() from js/app.js.
// api/session.php  POST {password}   -> {ok:bool}   validate server-side later
// api/content.php  GET               -> JSON merged over CONTENT (messages, emails, files)
// api/progress.php POST {state JSON} -> {saved:true} persisted per session
session_start();
header('Content-Type: application/json');
$payload = json_decode(file_get_contents('php://input'), true) ?? [];
if (!empty($payload['reset'])) {
    unset($_SESSION['ds']);
    echo json_encode(['reset' => true]);
    exit;
}
$_SESSION['ds'] = $payload;
echo json_encode(['saved' => true]);

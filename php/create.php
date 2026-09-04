<?php
$conn = new mysqli("localhost","root","","booleanware");
if($conn->connect_error){ die("Connection failed: " . $conn->connect_error); }

$player = $_POST['player'] ?? '';
$infraccion = $_POST['infraccion'] ?? '';
$confianza = (int) ($_POST['confianza'] ?? 0);
$verdict = $_POST['verdict'] ?? 'suspicious';

$stmt = $conn->prepare("INSERT INTO reports (player, infraccion, confianza, verdict) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssis", $player, $infraccion, $confianza, $verdict);
echo $stmt->execute() ? "Report added" : "Error: ".$stmt->error;
$conn->close();
?>

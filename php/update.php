<?php
$conn = new mysqli("localhost","root","","booleanware");
$id = (int) ($_POST['id'] ?? 0);
$infraccion = $_POST['infraccion'] ?? '';
$confianza = (int) ($_POST['confianza'] ?? 0);
$verdict = $_POST['verdict'] ?? 'suspicious';
$stmt = $conn->prepare("UPDATE reports SET infraccion = ?, confianza = ?, verdict = ? WHERE id = ?");
$stmt->bind_param("sisi", $infraccion, $confianza, $verdict, $id);
echo $stmt->execute() ? "Report updated" : "Error: ".$stmt->error;
$conn->close();
?>

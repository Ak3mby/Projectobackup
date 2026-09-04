<?php
$conn = new mysqli("localhost","root","","booleanware");
$id = (int) ($_POST['id'] ?? 0);
$stmt = $conn->prepare("DELETE FROM reports WHERE id = ?");
$stmt->bind_param("i", $id);
echo $stmt->execute() ? "Report deleted" : "Error: ".$stmt->error;
$conn->close();
?>

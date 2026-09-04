<?php
$conn = new mysqli("localhost","root","","booleanware");
$result = $conn->query("SELECT * FROM reports ORDER BY created_at DESC");
while($row = $result->fetch_assoc()){
  echo htmlspecialchars($row['id']." - ".$row['player']." : ".$row['infraccion'])."<br>";
}
$conn->close();
?>

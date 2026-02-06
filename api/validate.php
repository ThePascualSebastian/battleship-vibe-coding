<?php
$data = json_decode(file_get_contents("php://input"), true);

foreach ($data["cells"] as $cell) {
  if ($cell < 0 || $cell >= 100) {
    echo json_encode(["valid" => false]);
    exit;
  }
  if (in_array($cell, $data["existing"])) {
    echo json_encode(["valid" => false]);
    exit;
  }
}

echo json_encode(["valid" => true]);

<?php
$data = json_decode(file_get_contents("php://input"), true);

$file = __DIR__ . "/stats.json";

if (!file_exists($file)) {
  file_put_contents($file, "[]");
}

$existing = json_decode(file_get_contents($file), true);
if (!is_array($existing)) $existing = [];

$playerAcc = round(
  count($data["computer"]["hits"]) / max(1, $data["player"]["turns"]),
  3
);

$computerAcc = round(
  count($data["player"]["hits"]) / max(1, $data["computer"]["turns"]),
  3
);

$existing[] = [
  "timestamp" => date("Y-m-d H:i:s"),
  "playerScore" => $data["player"]["score"],
  "computerScore" => $data["computer"]["score"],
  "playerAccuracy" => $playerAcc,
  "computerAccuracy" => $computerAcc,
  "playerTurns" => $data["player"]["turns"],
  "computerTurns" => $data["computer"]["turns"]
];

file_put_contents(
  $file,
  json_encode($existing, JSON_PRETTY_PRINT),
  LOCK_EX
);

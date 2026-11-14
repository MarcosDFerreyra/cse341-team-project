//src/controllers/trains.js
import {
  getTrainById as findTrainById,
  getAllTrains as findAllTrains,
} from "../models/trains.js";

// EJS controller: renders the page only. The train cards are filled in
// by public/js/main.js, which calls GET /api/trains in the browser.
export function trainsPage(req, res) {
  return res.render("trains", { title: "Trains" });
}

// API controller: GET /api/trains/:id
export async function getTrainById(req, res) {
  try {
    const { id } = req.params;

    const train = await findTrainById(id);

    if (!train) {
      return res.status(404).json({
        error: "Train not found",
      });
    }

    return res.status(200).json(train);
  } catch (error) {
    console.error("Error fetching train:", error);

    return res.status(500).json({
      error: "Failed to fetch train",
    });
  }
}

// API controller: GET /api/trains
// The list is wrapped in { trains } because the trains page and the tests
// already read payload.trains.
export async function getAllTrains(req, res) {
  try {
    const trains = await findAllTrains();

    return res.status(200).json({ trains });
  } catch (error) {
    console.error("Error fetching trains:", error);

    return res.status(500).json({
      error: "Failed to fetch trains",
    });
  }
}

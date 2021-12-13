import React, { useEffect, useState } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import axios from "axios";

import SubwayStationItem from "./SubwayStationItem";
import "./SubwayStations.css";

const SubwayStations = () => {
  const [stations, setStations] = useState([{ id: "", name: "", routes: [] }]);
  const [favStations, setFavStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFailure, setShowFailure] = useState(false);

  useEffect(() => {
    axios
      .get(process.env.REACT_APP_BACKEND + "/allStations")
      .then((res) => {
        setStations(res.data.sort((a, b) => (a.name >= b.name ? 1 : -1)));
        setShowFailure(false);
      })
      .catch((err) => {
        setShowFailure(true);
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const jwt = localStorage.getItem("token");
    axios
      .get(process.env.REACT_APP_BACKEND + "/getAllFavStations", {
        headers: { Authorization: `JWT ${jwt}` },
      })
      .then((response) => {
        if (response.data !== "no favorite stations") {
          const stationIDs = response.data.map((e) => {
            return e.id;
          });
          if (!favStations || favStations === []) {
            setFavStations(stationIDs);
          } else {
            let flag = false;
            stationIDs.forEach((e) => {
              // if different, refresh
              if (!favStations.includes(e)) {
                flag = true;
              }
            });
            if (flag) setFavStations(stationIDs);
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [favStations]);

  if (loading) {
    return (
      <div className="mainContent">
        <h1>Stations</h1>
        <div className="spinnerWrapper">
          <Spinner className="spinner" animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </div>
    );
  }

  if (showFailure) {
    return (
      <div className="mainContent">
        <h1>Stations</h1>
        <Alert
          variant="danger"
          onClose={() => setShowFailure(false)}
          dismissible
        >
          <p className="alertmsg">Error with fetching train data</p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mainContent">
      <h1>Stations</h1>
      <ListGroup className="stationsWrapper">
        {stations.map((st) => {
          if (favStations.includes(st.id)) {
            return <SubwayStationItem station={st} favStations={favStations} />;
          }
        })}
        {stations.map((st) => {
          return <SubwayStationItem station={st} favStations={favStations} />;
        })}
      </ListGroup>
    </div>
  );
};

export default SubwayStations;

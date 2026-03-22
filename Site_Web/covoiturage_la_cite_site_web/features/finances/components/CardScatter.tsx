"use client";

/**
 * CardScatter — enveloppe le graphique ScatterGainHeure dans une Card.
 */

import React from "react";
import Card from "./ui/Card";
import ScatterGainHeure from "./ScatterGainHeure";

function CardScatter() {
  return (
    <Card delay={175}>
      <ScatterGainHeure />
    </Card>
  );
}

export default CardScatter;

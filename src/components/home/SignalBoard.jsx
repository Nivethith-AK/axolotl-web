import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../lightswind/card';
import { Button } from '../lightswind/button';

export const SignalBoard = () => (
  <section className="signal-board-section" aria-label="Archive navigation">
    <div className="container-lg">
      <Card className="signal-board-card" bordered hoverable>
        <CardContent className="signal-board-content" padding="none">
          <div className="signal-board-copy">
            <span className="signal-board-kicker">// NEXT_TRANSMISSION</span>
            <h2>Follow the signal.</h2>
            <p>
              Move through the archive by sound, image, or collaboration. The full network is
              waiting beyond the first node.
            </p>
          </div>
          <div className="signal-board-visual" aria-hidden="true">
            <div className="signal-board-visual-header">
              <span>ROUTE_03</span>
              <span className="signal-board-live">LIVE</span>
            </div>
            <div className="signal-board-route">
              <span className="signal-node signal-node-origin"></span>
              <span className="signal-route-line"></span>
              <span className="signal-node signal-node-destination"></span>
              <span className="signal-route-pulse"></span>
            </div>
            <div className="signal-board-bars">
              <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
            </div>
          </div>
          <div className="signal-board-actions">
            <Button asChild variant="unstyled" className="signal-board-button">
              <Link to="/portfolio">OPEN_PORTFOLIO <span aria-hidden="true">-&gt;</span></Link>
            </Button>
            <Link className="signal-board-secondary" to="/connect">
              CONNECT //
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>
);
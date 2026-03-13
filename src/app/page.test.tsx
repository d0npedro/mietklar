import { render, screen } from "@testing-library/react";

import Home from "@/app/page";

describe("Landing page", () => {
  it("renders the key product promise and portal links", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: /jede miete\. jeder kostenblock\. jede aenderung offen erklaert\./i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /manager-demo ansehen/i }),
    ).toHaveAttribute("href", "/manager");
    expect(
      screen.getByRole("link", { name: /mieter-demo ansehen/i }),
    ).toHaveAttribute("href", "/mieter");
  });
});

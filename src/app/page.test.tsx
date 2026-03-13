import { render, screen } from "@testing-library/react";

import Home from "@/app/page";

describe("Landing page", () => {
  it("renders the key product promise and portal links", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: /was moechten sie heute sehen\?/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: /ich verwalte wohnungen.*bestand pflegen/i,
      }),
    ).toHaveAttribute("href", "/manager");
    expect(
      screen.getByRole("link", {
        name: /ich wohne hier.*mietaufschluesselung/i,
      }),
    ).toHaveAttribute("href", "/mieter");
  });
});

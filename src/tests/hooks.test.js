import { renderHook, waitFor } from "@testing-library/react";
import { getFilms } from "services/getFilms";
import { getFilm } from "services/getFilm";
import { useFilmsList } from "hooks/useFilmsList";
import { __clearFilmCache, useFilmDetail } from "hooks/useFilmDetail";

jest.mock("services/getFilms", () => ({
  getFilms: jest.fn(),
}));

jest.mock("services/getFilm", () => ({
  getFilm: jest.fn(),
}));

describe("hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __clearFilmCache();
  });

  it("loads films list", async () => {
    getFilms.mockResolvedValue({
      items: [{ id: 1, name: "Demo" }],
      paginate: { current_page: 2, total_page: 5 },
    });

    const { result } = renderHook(() => useFilmsList({ endpoint: "latest", page: 2 }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.meta.currentPage).toBe(2);
    expect(getFilms).toHaveBeenCalledWith("latest", 2);
  });

  it("caches film detail", async () => {
    getFilm.mockResolvedValue({ movie: { id: "film-1", name: "Test" } });

    const { result, rerender } = renderHook(({ slug }) => useFilmDetail(slug), {
      initialProps: { slug: "film-1" },
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.film?.id).toBe("film-1");
    expect(getFilm).toHaveBeenCalledTimes(1);

    rerender({ slug: "film-1" });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getFilm).toHaveBeenCalledTimes(1);
  });
});

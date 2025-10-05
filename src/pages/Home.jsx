import React, { useEffect, useMemo, useState } from "react";
import { Container } from "react-bootstrap";
import Template from "components/layout/Template";
import HeroSpotlight from "components/home/HeroSpotlight";
import QuickFilters from "components/home/QuickFilters";
import FilmRailSection from "components/home/FilmRailSection";
import FilmGridSection from "components/home/FilmGridSection";
import SpotlightGrid from "components/home/SpotlightGrid";
import ContinueWatchingSection from "components/home/ContinueWatchingSection";
import { getFilms } from "services/getFilms";
import { categories } from "utils/categories";
import { useSelector } from "react-redux";

function Home() {
  const [sectionsData, setSectionsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [hasPartialError, setHasPartialError] = useState(false);
  const favoriteList = useSelector((state) => state.favorites.items);

  const sectionConfigs = useMemo(
    () =>
      [
        categories[0]?.slug && {
          key: "latest",
          title: "Latest releases",
          slug: categories[0].slug,
          viewAll: "/danh-sach-phim",
        },
        categories[1]?.item?.[1]?.slug && {
          key: "single",
          title: "Top movies",
          slug: `${categories[1].slug}/${categories[1].item[1].slug}`,
          viewAll: "/danh-sach-phim?category=danh-sach&sub=phim-le&page=1",
        },
        categories[1]?.item?.[2]?.slug && {
          key: "series",
          title: "Binge-worthy series",
          slug: `${categories[1].slug}/${categories[1].item[2].slug}`,
          viewAll: "/danh-sach-phim?category=danh-sach&sub=phim-bo&page=1",
        },
        categories[1]?.item?.[0]?.slug && {
          key: "tvshows",
          title: "TV shows to follow",
          slug: `${categories[1].slug}/${categories[1].item[0].slug}`,
          viewAll: "/danh-sach-phim?category=danh-sach&sub=tv-shows&page=1",
        },
        categories[3]?.item?.[4]?.slug && {
          key: "vietnam",
          title: "Vietnam picks",
          slug: `${categories[3].slug}/${categories[3].item[4].slug}`,
          viewAll: "/danh-sach-phim?category=quoc-gia&sub=viet-nam&page=1",
        },
      ].filter(Boolean),
    []
  );

  useEffect(() => {
    let isMounted = true;

    const fetchSections = async () => {
      if (!sectionConfigs.length) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const results = await Promise.allSettled(sectionConfigs.map((config) => getFilms(config.slug)));

      if (!isMounted) {
        return;
      }

      const nextData = {};
      let encounteredError = false;

      results.forEach((result, index) => {
        const key = sectionConfigs[index].key;
        if (result.status === "fulfilled") {
          nextData[key] = result.value?.items || [];
        } else {
          encounteredError = true;
          nextData[key] = [];
          console.error(`Failed to fetch section ${key}:`, result.reason);
        }
      });

      setSectionsData(nextData);
      setHasPartialError(encounteredError);
      setLoading(false);
    };

    fetchSections();

    return () => {
      isMounted = false;
    };
  }, [sectionConfigs]);

  const featuredFilm = useMemo(() => {
    const prioritized = [
      sectionsData.latest?.[0],
      sectionsData.single?.[0],
      sectionsData.series?.[0],
      sectionsData.tvshows?.[0],
    ];

    return prioritized.find(Boolean) || null;
  }, [sectionsData]);

  const trendingList = useMemo(() => {
    const combined = [
      ...(sectionsData.latest || []),
      ...(sectionsData.single || []),
      ...(sectionsData.series || []),
    ];

    const unique = [];
    const seen = new Set();

    combined.forEach((film) => {
      if (!film?.slug || seen.has(film.slug)) {
        return;
      }
      seen.add(film.slug);
      unique.push(film);
    });

    return unique.slice(0, 10);
  }, [sectionsData]);

  const quickFilters = useMemo(() => {
    const genreCategory = categories[2];
    if (!genreCategory?.item) {
      return [];
    }

    return genreCategory.item.slice(0, 8).map((item) => ({
      label: item.name,
      to: `/danh-sach-phim?category=${genreCategory.slug}&sub=${item.slug}&page=1`,
    }));
  }, []);

  const spotlightItems = useMemo(() => {
    const combined = [
      ...(sectionsData.series || []),
      ...(sectionsData.vietnam || []),
      ...(sectionsData.tvshows || []),
    ];

    const unique = [];
    const seen = new Set();

    combined.forEach((film) => {
      if (!film?.slug || seen.has(film.slug)) {
        return;
      }
      seen.add(film.slug);
      unique.push(film);
    });

    return unique.slice(0, 4);
  }, [sectionsData]);

  const continueWatching = useMemo(() => (favoriteList || []).slice(0, 10), [favoriteList]);

  return (
    <Template>
      <Container className="home-page pt-5">
        {hasPartialError && (
          <div className="alert alert-warning" role="alert">
            Some sections failed to load. Try refreshing the page to fetch the latest data.
          </div>
        )}

        <HeroSpotlight film={featuredFilm} trending={trendingList} />

        <QuickFilters filters={quickFilters} />

        <ContinueWatchingSection items={continueWatching} />

        <FilmRailSection
          title="Trending today"
          films={trendingList}
          viewAllLink="/danh-sach-phim"
          loading={loading && !trendingList.length}
        />

        <SpotlightGrid items={spotlightItems} />

        {sectionConfigs.map((config) => (
          <FilmGridSection
            key={config.key}
            title={config.title}
            films={sectionsData[config.key] || []}
            viewAllLink={config.viewAll}
            loading={loading && !(sectionsData[config.key]?.length)}
          />
        ))}
      </Container>
    </Template>
  );
}

export default Home;

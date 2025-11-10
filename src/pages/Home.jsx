import React, { useEffect, useMemo, useState } from "react";
import { Container } from "react-bootstrap";
import Template from "components/layout/Template";
import HeroSpotlight from "components/home/HeroSpotlight";
import FilmRailSection from "components/home/FilmRailSection";
import FilmGridSection from "components/home/FilmGridSection";
import { getFilms } from "services/getFilms";
import { categories } from "utils/categories";

function Home() {
  const [sectionsData, setSectionsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [hasPartialError, setHasPartialError] = useState(false);

  const sectionConfigs = useMemo(
    () =>
      [
        categories[0]?.slug && {
          key: "latest",
          title: "Phim mới cập nhật",
          slug: categories[0].slug,
          viewAll: "/danh-sach-phim",
        },
        categories[1]?.item?.[1]?.slug && {
          key: "single",
          title: "Phim lẻ nổi bật",
          slug: `${categories[1].slug}/${categories[1].item[1].slug}`,
          viewAll: "/danh-sach-phim?category=danh-sach&sub=phim-le&page=1",
        },
        categories[1]?.item?.[2]?.slug && {
          key: "series",
          title: "Phim bộ đáng xem",
          slug: `${categories[1].slug}/${categories[1].item[2].slug}`,
          viewAll: "/danh-sach-phim?category=danh-sach&sub=phim-bo&page=1",
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
    const prioritized = [sectionsData.latest?.[0], sectionsData.single?.[0], sectionsData.series?.[0]];

    return prioritized.find(Boolean) || null;
  }, [sectionsData]);

  const trendingList = useMemo(() => {
    const combined = [...(sectionsData.latest || []), ...(sectionsData.single || []), ...(sectionsData.series || [])];

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

  const highlightStats = useMemo(
    () => [
      { label: "Phim mới cập nhật", value: sectionsData.latest?.length || 0 },
      { label: "Phim lẻ nổi bật", value: sectionsData.single?.length || 0 },
      { label: "Phim bộ đáng xem", value: sectionsData.series?.length || 0 },
    ],
    [sectionsData]
  );

  return (
    <Template>
      <Container className="home-page pt-5">
        {hasPartialError && (
          <div className="alert alert-warning" role="alert">
            Không thể tải đầy đủ dữ liệu. Vui lòng thử tải lại trang.
          </div>
        )}

        <HeroSpotlight film={featuredFilm} trending={trendingList} />

        <section className="home-info-banner">
          <div>
            <p className="text-uppercase text-danger mb-1">Không gian xem phim tối giản</p>
            <h2 className="fw-bold mb-2">Giảm bớt ồn ào, giữ lại thứ bạn cần: phim hay</h2>
            <p className="text-body-secondary mb-0">
              Chúng tôi chỉ giữ những khối nội dung quan trọng – spotlight, danh sách thịnh hành và vài kệ phim chọn lọc.
              Bạn không phải cuộn qua quá nhiều banner hay khối quảng bá nữa.
            </p>
          </div>
          {highlightStats.map((item) => (
            <div key={item.label} className="home-info-banner__stat">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </section>

        <FilmRailSection
          title="Đang thịnh hành hôm nay"
          films={trendingList}
          viewAllLink="/danh-sach-phim"
          loading={loading && !trendingList.length}
        />

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


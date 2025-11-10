import React, { useMemo } from "react";
import { Container } from "react-bootstrap";
import Template from "components/layout/Template";
import HeroSpotlight from "components/home/HeroSpotlight";
import FilmRailSection from "components/home/FilmRailSection";
import FilmGridSection from "components/home/FilmGridSection";
import { categories } from "utils/categories";
import { useFilmsList } from "hooks/useFilmsList";

function Home() {
  const latestEndpoint = categories[0]?.slug || null;
  const singleEndpoint = categories[1]?.item?.[1]?.slug ? `${categories[1].slug}/${categories[1].item[1].slug}` : null;
  const seriesEndpoint = categories[1]?.item?.[2]?.slug ? `${categories[1].slug}/${categories[1].item[2].slug}` : null;

  const latest = useFilmsList({ endpoint: latestEndpoint, enabled: Boolean(latestEndpoint) });
  const single = useFilmsList({ endpoint: singleEndpoint, enabled: Boolean(singleEndpoint) });
  const series = useFilmsList({ endpoint: seriesEndpoint, enabled: Boolean(seriesEndpoint) });

  const sectionResults = [
    latestEndpoint && { key: "latest", title: "Phim mới cập nhật", viewAll: "/danh-sach-phim", endpoint: latestEndpoint, ...latest },
    singleEndpoint && {
      key: "single",
      title: "Phim lẻ nổi bật",
      viewAll: "/danh-sach-phim?category=danh-sach&sub=phim-le&page=1",
      endpoint: singleEndpoint,
      ...single,
    },
    seriesEndpoint && {
      key: "series",
      title: "Phim bộ đáng xem",
      viewAll: "/danh-sach-phim?category=danh-sach&sub=phim-bo&page=1",
      endpoint: seriesEndpoint,
      ...series,
    },
  ].filter(Boolean);

  const sectionsData = sectionResults.reduce((acc, result) => {
    acc[result.key] = result.items || [];
    return acc;
  }, {});

  const loading = sectionResults.some((result) => result.loading);
  const hasPartialError = sectionResults.some((result) => result.error);

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

        {sectionResults.map((config) => (
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


import Image from "next/image";
import type { FormacionHub } from "@/lib/formaciones-online";

type ContentGrid = {
  variant?: string;
  intro?: string;
  eyebrow?: string;
  card_title?: string;
  paragraphs?: string[];
  card_footer?: string;
  goals_title?: string;
  goals?: string[];
  video_embed?: string;
  video_title?: string;
  audience_title?: string;
  audience_lead?: string;
  audience_body?: string;
  middle_paragraphs?: string[];
  audience_paragraphs?: string[];
  audience_image?: string;
  audience_image_mobile?: string;
  audience_image_alt?: string;
};

function HubVideoFrame({
  embed,
  title,
  ratio16x9 = false,
}: {
  embed: string;
  title: string;
  ratio16x9?: boolean;
}) {
  const iframe = (
    <iframe
      src={embed}
      title={title}
      allowFullScreen
      allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );

  return (
    <div className="hub-club-card__video-frame">
      {ratio16x9 ? (
        <div className="tutor-ratio tutor-ratio-16x9">{iframe}</div>
      ) : (
        iframe
      )}
    </div>
  );
}

function HubAudienceCard({ grid }: { grid: ContentGrid }) {
  const hasText =
    grid.audience_body ||
    grid.audience_title ||
    grid.audience_lead ||
    (grid.middle_paragraphs?.length ?? 0) > 0 ||
    (grid.audience_paragraphs?.length ?? 0) > 0;

  if (!hasText && !grid.audience_image) return null;

  return (
    <article
      className={`hub-club-grid__audience hub-club-card${grid.audience_image ? "" : " hub-club-grid__audience--text-only"}`}
    >
      <div className="hub-club-grid__audience-text">
        {grid.audience_lead && (
          <h3 className="hub-club-card__subtitle">{grid.audience_lead}</h3>
        )}
        {grid.middle_paragraphs?.map((p) => (
          <p key={p} className="hub-club-card__body">
            {p}
          </p>
        ))}
        {grid.audience_title && (
          <h3 className="hub-club-card__subtitle">{grid.audience_title}</h3>
        )}
        {grid.audience_body && (
          <p className="hub-club-card__body">{grid.audience_body}</p>
        )}
        {grid.audience_paragraphs?.map((p) => (
          <p key={p} className="hub-club-card__body">
            {p}
          </p>
        ))}
      </div>
      {grid.audience_image && (
        <div className="hub-club-grid__audience-media">
          {grid.audience_image_mobile && (
            <Image
              className="hub-club-grid__audience-img hub-club-grid__audience-img--mobile"
              src={grid.audience_image_mobile}
              alt={grid.audience_image_alt ?? grid.audience_title ?? ""}
              width={1200}
              height={675}
              unoptimized
            />
          )}
          <Image
            className={`hub-club-grid__audience-img hub-club-grid__audience-img--desktop${grid.audience_image_mobile ? "" : " hub-club-grid__audience-img--only"}`}
            src={grid.audience_image}
            alt={grid.audience_image_alt ?? grid.audience_title ?? ""}
            width={600}
            height={800}
            unoptimized
          />
        </div>
      )}
    </article>
  );
}

function HubContentGridVideoLeft({ grid }: { grid: ContentGrid }) {
  const videoTitle = grid.video_title ?? "Presentación del programa";

  return (
    <section className="hub-club-grid hub-club-grid--video-left">
      <div className="hub-club-grid__inner">
        {grid.video_embed && (
          <article className="hub-club-grid__video hub-club-card">
            <HubVideoFrame embed={grid.video_embed} title={videoTitle} />
          </article>
        )}

        <div className="hub-club-grid__right">
          <article className="hub-club-grid__includes hub-club-card hub-club-grid__includes--text-only">
            <div className="hub-club-grid__includes-text">
              {grid.card_title && (
                <h3 className="hub-club-card__subtitle">{grid.card_title}</h3>
              )}
              {grid.paragraphs?.map((p) => (
                <p key={p} className="hub-club-card__body">
                  {p}
                </p>
              ))}
              {grid.card_footer && (
                <p className="hub-club-card__body hub-club-card__body--emphasis">
                  {grid.card_footer}
                </p>
              )}
            </div>
          </article>

          <HubAudienceCard grid={grid} />
        </div>
      </div>
    </section>
  );
}

function HubContentGridDefault({ grid }: { grid: ContentGrid }) {
  const videoTitle = grid.video_title ?? "Presentación del programa";
  const showAudience =
    grid.audience_body ||
    grid.audience_title ||
    (grid.audience_paragraphs?.length ?? 0) > 0;

  return (
    <section className="hub-club-grid">
      <div className="hub-club-grid__inner">
        <article className="hub-club-grid__main hub-club-card">
          {grid.eyebrow && (
            <p className="hub-club-card__eyebrow">{grid.eyebrow}</p>
          )}
          {grid.card_title && (
            <h2 className="hub-club-card__brand">{grid.card_title}</h2>
          )}
          {grid.intro && <p className="hub-club-card__intro">{grid.intro}</p>}
          {grid.paragraphs?.map((p) => (
            <p key={p} className="hub-club-card__paragraph">
              {p}
            </p>
          ))}
          {grid.goals_title && (
            <h2 className="hub-club-card__title">{grid.goals_title}</h2>
          )}
          {grid.goals && grid.goals.length > 0 && (
            <ul className="hub-club-card__list">
              {grid.goals.map((goal) => (
                <li key={goal}>{goal}</li>
              ))}
            </ul>
          )}
        </article>

        <div className="hub-club-grid__aside">
          {grid.video_embed && (
            <article className="hub-club-grid__video hub-club-card">
              <HubVideoFrame
                embed={grid.video_embed}
                title={videoTitle}
                ratio16x9
              />
            </article>
          )}
          {showAudience && <HubAudienceCard grid={grid} />}
        </div>
      </div>
    </section>
  );
}

export function HubContentGrid({ hub }: { hub: FormacionHub }) {
  const grid = (hub.content_grid ?? {}) as ContentGrid;

  const isEmpty =
    !grid.intro &&
    !(grid.paragraphs?.length ?? 0) &&
    !(grid.goals?.length ?? 0) &&
    !grid.card_title &&
    !grid.audience_body &&
    !(grid.audience_paragraphs?.length ?? 0) &&
    !(grid.middle_paragraphs?.length ?? 0) &&
    !grid.video_embed;

  if (isEmpty) return null;

  if (grid.variant === "video-left") {
    return <HubContentGridVideoLeft grid={grid} />;
  }

  return <HubContentGridDefault grid={grid} />;
}

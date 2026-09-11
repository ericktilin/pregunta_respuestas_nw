-- =====================================================================
-- MIGRACIÓN 004 :: Votos "like" por usuario
-- Ejecutar con: npm run db:migrate
--
-- Cada usuario puede dar UN solo like por pregunta. La tabla registrar
-- autores del voto; el contador votes_count se mantiene desde el
-- endpoint POST /api/questions/:id/vote (toggle).
-- =====================================================================

CREATE TABLE question_votes (
  question_id NUMBER NOT NULL,
  user_id     NUMBER NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_question_votes PRIMARY KEY (question_id, user_id),
  CONSTRAINT fk_question_votes_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  CONSTRAINT fk_question_votes_user     FOREIGN KEY (user_id)     REFERENCES users(id)
);
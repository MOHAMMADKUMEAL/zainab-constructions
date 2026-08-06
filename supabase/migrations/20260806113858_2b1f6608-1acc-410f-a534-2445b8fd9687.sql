CREATE POLICY "own payment screenshots select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'payment-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own payment screenshots insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payment-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own payment screenshots update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'payment-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'payment-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own payment screenshots delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'payment-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text);
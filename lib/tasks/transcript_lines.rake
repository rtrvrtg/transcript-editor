namespace :transcript_lines do

  # Usage:
  #     rake transcript_lines:recalculate[0,0,1]
  #     rake transcript_lines:recalculate[0,'adrian-wagner-nxr3fk']
  #     rake transcript_lines:recalculate[56]
  #     rake transcript_lines:recalculate
  desc "Recalculate a line, a transcript's lines, or all lines"
  task :recalculate, [:line_id, :transcript_uid, :original_text] => :environment do |task, args|
    args.with_defaults line_id: 0
    args.with_defaults transcript_uid: false
    args.with_defaults original_text: false

    lines = []
    line_id = args[:line_id].to_i

    if line_id > 0
      lines = TranscriptLine.where(id: line_id)

    elsif !args[:original_text].blank?
      lines = TranscriptLine.where("text = original_text")

    elsif !args[:transcript_uid].blank?
      transcript = Transcript.find_by(uid: args[:transcript_uid])
      lines = TranscriptLine.getEditedByTranscriptId(transcript.id)

    else
      lines = TranscriptLine.getEdited
    end

    lines.each do |line|
      line.recalculate
    end

  end

  task :from_vtt, [:transcript_id, :vtt_file] => :environment do |task, args|
    args.with_default transcript_id: nil
    args.with_default vtt_file: nil
    if args[:transcript_id].nil?
      raise InputError.new("Transcript ID must be set")
    end
    if args[:vtt_file].nil?
      raise InputError.new("VTT file path must be set")
    end

    Transcript.find(args[:transcript_id]).loadFromHash(args[:vtt_file])
  end

end
